import async from "async";
import worker from "worker_threads";
import { gunzip, gzip } from "zlib";
import * as Toram from "../../toram.json" assert { type: "json" };
import { AsyncNext } from "../middleware/cacher/types/AsyncNext.js";
import { ToramMonster } from "../types/ToramMonster.js";
import { calculateExpAmount, calculateExpBonus } from "./calculation/index.js";
import { getMonsterInfoByLevel, getMonsterListOfLevel } from "./functions/getMonsterList.js";
import {
	GuideLevelModel,
	GuideLevelModelEntry,
	GuideOptions,
	GuideResult,
	GuideResultListEntry,
	GuideResultListEntryItem,
	GuideResultSuccess,
} from "./types/index.js";

// store monster/battle data per level - level model
export const pomieLevelModels: { [key: number]: Buffer } = {};
const monsterTypes = ["boss", "mini", "mons"];

export default class LevelGuide {
	// requested command of this level guide
	#command: string;
	// guide options
	#guideOptions: GuideOptions;
	// mapping <Level> => [List of monster of that level]
	#guideLevelModelMappings: {
		[key: number]: GuideLevelModel;
	} = {};
	// guide result
	#guideResult: GuideResultSuccess;

	// [ #1 ] ======================================================================================================
	/**
	 * Generates a leveling guide object based on given arguments
	 *   args: <start_level> [dest_level] [--aditional args]
	 *
	 *      - start_level: starting level
	 *      - dest_level: destination level
	 *      - additional args:
	 *
	 *          -e/--exp: fixed exp bonus, will override --auto
	 *          -b/--boss: filter to bosses only
	 *          -m/--mini: filter to mini-bosses only
	 *          -M/--mob: filter to normal mobs only
	 *          -n/--normal: filter to normal bosses only
	 *          -h/--hard: filter to hard bosses only
	 *          -nm/--nightmare: filter to nightmare bosses only
	 *          -u/--ultimate: filter to ultimate bosses only
	 * 			-pr/--preserve: set amount of level difference before splitting level range for highest ranked monster
	 * 			-ev/--event: show/hide event-limited monsters
	 * 			-lm/--level-limit: limit exp bonus by player's highest character level
	 */
	constructor(command: string) {
		if (command.length === 0) {
			throw new Error("No argument was given");
		}

		this.#command = command;
		this.#guideOptions = {
			_levelStart: Math.abs(Number(command.match(/\d+/g)?.at(0) || 1)),
			_levelEnd: Math.abs(Number(command.match(/\d+/g)?.at(1) || 2)),
		};

		// if end level is equals to start level
		if (this.#guideOptions._levelEnd === this.#guideOptions._levelStart) {
			this.#guideOptions._levelEnd = this.#guideOptions._levelStart + 1;
		}

		// reverse if numbers are opposite
		if (this.#guideOptions._levelEnd < this.#guideOptions._levelStart) {
			const swap = this.#guideOptions._levelEnd;
			this.#guideOptions._levelEnd = this.#guideOptions._levelStart;
			this.#guideOptions._levelStart = swap;
		}

		// assign level array
		this.#guideOptions._levelArray = Array(
			Math.ceil(this.#guideOptions._levelEnd + 1 - this.#guideOptions._levelStart)
		)
			.fill(this.#guideOptions._levelStart)
			.map((x, y) => x + y);

		// base guide result
		this.#guideResult = {
			type: 2,
			pr: this.#guideOptions.preserveRanking,
			startLevel: this.#guideOptions._levelStart,
			endLevel: this.#guideOptions._levelEnd,
			totalExp: calculateExpAmount(this.#guideOptions._levelStart, this.#guideOptions._levelEnd),
			bonusExp: this.#guideOptions.expBonus > 0 ? this.#guideOptions.expBonus : undefined,
			list: [],
		};

		// filter through arguments and assign values
		const partials = this.#command.split(" ");
		for (const partial of partials) {
			switch (partial) {
				case "-e":
				case "--exp":
					this.#assignValueOfFlag(partial, partials, "expBonus");
					break;
				case "-pr":
				case "--preserve":
					this.#assignValueOfFlag(partial, partials, "preserveRanking");
					break;
				case "-lm":
				case "--level-limit":
					this.#assignValueOfFlag(partial, partials, "playerMaxLevel");
					break;
				case "-b":
				case "--boss":
					this.#guideOptions.monsterFilter = 1;
					break;
				case "-m":
				case "--mini":
					this.#guideOptions.monsterFilter = 2;
					break;
				case "-n":
				case "--normal":
					this.#guideOptions.monsterFilter = 3;
					break;
				case "-h":
				case "--hard":
					this.#guideOptions.monsterFilter = 4;
					break;
				case "-nm":
				case "--nightmare":
					this.#guideOptions.monsterFilter = 5;
					break;
				case "-u":
				case "--ultimate":
					this.#guideOptions.monsterFilter = 6;
					break;
				case "-M":
				case "--mob":
					this.#guideOptions.monsterFilter = 7;
					break;
				case "-ev":
				case "--event":
					this.#guideOptions.includeEventMonsters = true;
					break;
				// hidden option
				case "--skip-cache":
					this.#guideOptions.skipCache = true;
			}
		}
	}

	/**
	 * Assign value to guide option
	 * @param partial Command flag
	 * @param partials List of command sub strings
	 * @param option The guide option to update
	 */
	#assignValueOfFlag = (partial: string, partials: string[], option: string) => {
		const value = partials[partials.indexOf(partial) + 1];

		if (value && !Number.isNaN(value)) {
			this.#guideOptions[option] = Number(value);
		}
	};
	// [ #1 ] ======================================================================================================

	// [ #2 ] ======================================================================================================
	/**
	 * Async task to generate model of a level
	 * @param level Level to generate model
	 * @returns Promise whether task is completed
	 */
	#generateLevelModelMapping = (level: number) =>
		new Promise((resolve) => {
			async.waterfall(
				[
					(next: AsyncNext) => {
						// if level model exists and exp bonus is unchanged
						if (!this.#guideOptions.skipCache && pomieLevelModels[level]) {
							this.#taskGLMMUnzip(level)
								.then((model) => next(null, model))
								.catch(console.error);
						} else {
							this.#taskGLMMGenNew(level)
								.then((model) => next(null, model))
								.catch(console.error);
						}
					},
					(levelModel: GuideLevelModel, next: AsyncNext) => {
						// filter monsters by type
						// any boss
						if ([1, 3, 4, 5, 6].includes(this.#guideOptions.monsterFilter)) {
							levelModel.mini = [];
							levelModel.mons = [];
						}
						switch (this.#guideOptions.monsterFilter) {
							// miniboss
							case 2: {
								levelModel.boss = [];
								levelModel.mons = [];
								break;
							}
							// boss - normal
							case 3: {
								levelModel.boss = levelModel.boss.filter((entry) => entry.type.includes("Normal"));
								break;
							}
							// boss - hard
							case 4: {
								levelModel.boss = levelModel.boss.filter((entry) => entry.type.includes("Hard"));
								break;
							}
							// boss - nightmare
							case 5: {
								levelModel.boss = levelModel.boss.filter((entry) => entry.type.includes("Nightmare"));
								break;
							}
							// boss - ultimate
							case 6: {
								levelModel.boss = levelModel.boss.filter((entry) => entry.type.includes("Ultimate"));
								break;
							}
							// normal monsters
							case 7: {
								levelModel.boss = [];
								levelModel.mini = [];
								break;
							}
						}

						// set model to level mapping
						this.#guideLevelModelMappings[level] = levelModel;

						// complete
						next();
					},
				],
				() => resolve(true)
			);
		});

	/**
	 * Get a level model from cache, if any
	 * @param level Target level model to get
	 * @returns Cached level model object
	 */
	#taskGLMMUnzip = (level: number): Promise<GuideLevelModel> =>
		new Promise((resolve) => {
			gunzip(pomieLevelModels[level], (_, buffer) => {
				resolve(JSON.parse(buffer.toString()));
			});
		});

	/**
	 * Generate or get from cache model of a level
	 * @param level Level to generate new model of
	 * @returns Level model object
	 */
	#taskGLMMGenNew = (level: number): Promise<GuideLevelModel> =>
		new Promise((resolve) => {
			const levelModel: GuideLevelModel = {
				boss: [],
				mini: [],
				mons: [],
				unified: [],
			};

			// get current level exp bonus
			const currentLevelBonus =
				(this.#guideOptions.expBonus || 0) +
				calculateExpBonus(level, this.#guideOptions.playerMaxLevel, this.#guideOptions.expBonus === undefined);

			// get current level mob list
			getMonsterListOfLevel({ level, bonus: currentLevelBonus })
				.then((currentLevelList) => {
					// get current level mob entries
					for (const entry of currentLevelList) {
						const entryModel = {
							id: entry.monster.id,
							name: entry.monster.name,
							type: entry.monster.type,
							map: entry.monster.map,
							level: entry.monster.level,
							exp: entry.monster.exp,
							expWithBonus: entry.expWithBonus,
						};

						levelModel.unified.push(entryModel);
						if (entry.monster.type.startsWith("Boss -")) levelModel.boss.push(entryModel);
						if (entry.monster.type.startsWith("Miniboss")) levelModel.mini.push(entryModel);
						if (entry.monster.type.startsWith("Monster")) levelModel.mons.push(entryModel);
					}
					// release array
					currentLevelList.length = 0;

					// store base model to global mapping
					gzip(JSON.stringify(levelModel), (_, buffer) => {
						pomieLevelModels[level] = buffer;

						resolve(levelModel);
					});
				})
				.catch(console.error);
		});

	/**
	 * Parallel generate level model mappings
	 * @returns Promise whether task is completed
	 */
	#taskGenerateLevelModelMappings = () =>
		new Promise((resolve) => {
			async.parallel(
				this.#guideOptions._levelArray.map(
					(level) => (done) => this.#generateLevelModelMapping(level).then(() => done())
				),
				() => resolve(true)
			);
		});
	// [ #2 ] ======================================================================================================

	// [ #3 ] ======================================================================================================
	#tempLevelRangeData: {
		// starting level in which preceeding ones have the same value
		fixedLevel: number;

		// preserve rankings mode, only split when exp bonus is different or top 1 entry no longer in rankings in next level
		preserveRankings: {
			boss: string;
			mini: string;
			mons: string;
		};

		// fixed boss data when multiple levels have the same value
		boss: {
			[key: string]: {
				battleCountWithBonus: number;
				battleCountWithoutBonus: number;
			};
		};

		// fixed miniboss data when multiple levels have the same value
		mini: {
			[key: string]: {
				battleCountWithBonus: number;
				battleCountWithoutBonus: number;
			};
		};

		// fixed normal monster data when multiple levels have the same value
		mons: {
			[key: string]: {
				battleCountWithBonus: number;
				battleCountWithoutBonus: number;
			};
		};
	};

	/**
	 * Generate the level guide result, also is the MAIN task here
	 * @returns Guide result object
	 */
	generate = (): Promise<GuideResult> =>
		new Promise((resolve) => {
			// first generate the model mappings
			this.#taskGenerateLevelModelMappings()
				.then(() => {
					this.#tempLevelRangeData = {
						fixedLevel: this.#guideOptions._levelStart,
						boss: {},
						mini: {},
						mons: {},
						preserveRankings: {
							boss: this.#guideLevelModelMappings[this.#guideOptions._levelStart].boss.at(0)?.id,
							mini: this.#guideLevelModelMappings[this.#guideOptions._levelStart].mini.at(0)?.id,
							mons: this.#guideLevelModelMappings[this.#guideOptions._levelStart].mons.at(0)?.id,
						},
					};

					for (const level of this.#guideOptions._levelArray) {
						const data: CurrentLevelData = {
							// current level data
							currentLevel: {
								// level number
								asNumber: level,
								// level monster data
								levelModel: this.#guideLevelModelMappings[level],
								// level exp bonus %
								levelExpBonus:
									(this.#guideOptions.expBonus || 0) +
									calculateExpBonus(
										level,
										this.#guideOptions.playerMaxLevel,
										this.#guideOptions.expBonus === undefined
									),
							},

							// next level data
							nextLevel: {
								// level number
								asNumber: level + 1,
								// level monster data
								levelModel: this.#guideLevelModelMappings[level + 1],
								// level exp bonus %
								levelExpBonus:
									(this.#guideOptions.expBonus || 0) +
									calculateExpBonus(
										level + 1,
										this.#guideOptions.playerMaxLevel,
										this.#guideOptions.expBonus === undefined
									),
							},
						};

						// Process the level data here
						this.#taskGenProcessLevel(level, data);
					}

					resolve(this.#guideResult);
				})
				.catch(console.error);
		});

	/**
	 * Quick note: All the tasks below are in order as how they'll run
	 */

	/**
	 * Count the amount of battles/kills of a monster in a level
	 * @param monster Monster entry to count
	 * @param level Current level as number
	 * @param levelExpBonus Current level exp bonus %
	 */
	#taskGenCountBattle = (monster: GuideLevelModelEntry, level: number, levelExpBonus: number) => {
		const monsterInfo = getMonsterInfoByLevel(monster as unknown as ToramMonster, level, levelExpBonus);

		// loop through monster type and run task depends on current monster entry type
		for (const type of monsterTypes) {
			// ignore this loop if type does match with entrys
			if (!monster.type.toLowerCase().startsWith(type)) {
				continue;
			}

			// assign monster data to monster type map if not found
			this.#tempLevelRangeData[type][monster.id] ||= {
				battleCountWithBonus: 0,
				battleCountWithoutBonus: 0,
			};

			this.#tempLevelRangeData[type][monster.id].battleCountWithBonus += Math.round(
				calculateExpAmount(level) / monsterInfo.expWithBonus
			);

			this.#tempLevelRangeData[type][monster.id].battleCountWithoutBonus += Math.round(
				calculateExpAmount(level) / monsterInfo.expWithoutBonus
			);

			// set battle count to 1 if any number is 0
			if (this.#tempLevelRangeData[type][monster.id].battleCountWithBonus === 0)
				this.#tempLevelRangeData[type][monster.id].battleCountWithBonus = 1;
			if (this.#tempLevelRangeData[type][monster.id].battleCountWithoutBonus === 0)
				this.#tempLevelRangeData[type][monster.id].battleCountWithoutBonus = 1;
		}
	};

	/**
	 * Check for changes between two levels
	 * @param data Data from parent scope
	 * @returns Whether a change exists or not
	 */
	#taskGenCheckForChanges = (data: CurrentLevelData) => {
		// difference check between 2 levels
		const check = {
			// if 2 levels have different ranked monster entry
			differentMonster:
				data.currentLevel.levelModel.boss?.[0]?.id !== data.nextLevel.levelModel.boss?.[0]?.id ||
				data.currentLevel.levelModel.mini?.[0]?.id !== data.nextLevel.levelModel.mini?.[0]?.id ||
				data.currentLevel.levelModel.mons?.[0]?.id !== data.nextLevel.levelModel.mons?.[0]?.id,

			// if 2 different level state
			differentLevel: data.currentLevel.asNumber !== this.#tempLevelRangeData.fixedLevel,

			// if 2 levels have different exp bonus
			differentExpBonus:
				calculateExpBonus(data.currentLevel.asNumber, this.#guideOptions.playerMaxLevel) !==
				calculateExpBonus(data.nextLevel.asNumber, this.#guideOptions.playerMaxLevel),

			// if current loop is at last level
			atLastLevel: data.currentLevel.asNumber + 1 === this.#guideOptions._levelEnd,

			// if preserve rankings is applied, set rankings to this fixed level highest ranking monster of each type
			preserveRanking: {
				boss: data.nextLevel.levelModel.boss
					?.slice(0, this.#guideOptions.preserveRanking)
					?.find((z) => this.#tempLevelRangeData.preserveRankings.boss === z.id)?.id,
				mini: data.nextLevel.levelModel.mini
					?.slice(0, this.#guideOptions.preserveRanking)
					?.find((z) => this.#tempLevelRangeData.preserveRankings.mini === z.id)?.id,
				mons: data.nextLevel.levelModel.mons
					?.slice(0, this.#guideOptions.preserveRanking)
					?.find((z) => this.#tempLevelRangeData.preserveRankings.mons === z.id)?.id,
			},
		};

		return !(
			check.atLastLevel ||
			(check.differentLevel && check.differentExpBonus) ||
			(!this.#guideOptions.preserveRanking && check.differentMonster) ||
			(this.#guideOptions.preserveRanking &&
				!check.preserveRanking.boss &&
				!check.preserveRanking.mini &&
				!check.preserveRanking.mons)
		);
	};

	/**
	 * Process this level data
	 * @param level Current level of the loop
	 * @param data Data from parent scope
	 */
	#taskGenProcessLevel = (level: number, data: CurrentLevelData) => {
		// if next level data doesn't exist, ignore
		if (!data.nextLevel.levelModel) {
			return;
		}

		// stack up monster entry battle count
		for (const monster of data.currentLevel.levelModel.unified) {
			this.#taskGenCountBattle(monster, level, data.currentLevel.levelExpBonus);
		}

		// ignore if nothing changed between two level
		if (this.#taskGenCheckForChanges(data)) {
			return;
		}

		// final level range result object
		const levelRangeResult: GuideResultListEntry = {
			bonusExp:
				(this.#guideOptions.expBonus || 0) +
				calculateExpBonus(
					data.currentLevel.asNumber,
					this.#guideOptions.playerMaxLevel,
					this.#guideOptions.expBonus === undefined
				),
			startLevel: this.#tempLevelRangeData.fixedLevel,
			endLevel: data.currentLevel.asNumber,
			boss: [],
			mini: [],
			mons: [],
		};

		// Assign the monsters to their respective type in the result object
		for (const type of monsterTypes) {
			levelRangeResult[type] = (data.currentLevel.levelModel[type] as GuideResultListEntryItem[]).map(
				(entry) => ({
					id: entry.id,
					type: entry.type,
					name: entry.name,
					level: entry.level,
					exp: entry.exp,
					map: entry.map,
					count: this.#tempLevelRangeData[type][entry.id].battleCountWithBonus,
					countWithoutBonus: this.#tempLevelRangeData[type][entry.id].battleCountWithoutBonus,
					preserve:
						this.#guideOptions.preserveRanking &&
						entry.id === this.#tempLevelRangeData.preserveRankings.boss,
				})
			);
		}

		// Sanitize the result, mostly remove Event-limited mosnters
		this.#taskGenSanitizeResult(levelRangeResult);

		// Push to the main result list
		this.#guideResult.list.push(levelRangeResult);

		// Reset the data, and continue to next level
		this.#taskGenResetData(data);
	};

	/**
	 * Sanitize results, mostly remove Event-limited monsters
	 * @param levelRangeResult Level range result object from parent scope
	 */
	#taskGenSanitizeResult = (levelRangeResult: GuideResultListEntry) => {
		for (const type of monsterTypes) {
			const sanitizedArray: GuideResultListEntryItem[] = [];

			for (const entry of levelRangeResult[type] as GuideResultListEntryItem[]) {
				const isOutsideLevelRange = entry?.level - levelRangeResult.startLevel > 9;
				const isWithinIgnoredNames =
					!this.#guideOptions.includeEventMonsters &&
					// included in ignored name/id list
					Toram.default.leveling.ignoredList.byName.some(
						(name) =>
							name.toUpperCase().includes(entry.id) ||
							entry?.name?.toLowerCase().includes(name.toLowerCase())
					);
				const isWithinIgnoredMaps =
					!this.#guideOptions.includeEventMonsters &&
					Toram.default.leveling.ignoredList.byMap.some((map) => new RegExp(map, "i").test(entry.map));

				// If all entry is clean, add to the array
				if (!(isOutsideLevelRange || isWithinIgnoredNames || isWithinIgnoredMaps)) {
					sanitizedArray.push(entry);
				}
			}

			levelRangeResult[type] = [...sanitizedArray].sort((r1, r2) => r1.count - r2.count);
		}
	};

	/**
	 * Flush all existing data and proceed to next level
	 */
	#taskGenResetData = (data: CurrentLevelData) => {
		this.#tempLevelRangeData.fixedLevel = data.nextLevel.asNumber;
		this.#tempLevelRangeData.boss = {};
		this.#tempLevelRangeData.mini = {};
		this.#tempLevelRangeData.mons = {};
		this.#tempLevelRangeData.preserveRankings = {
			boss: data.nextLevel.levelModel.boss.at(0)?.id,
			mini: data.nextLevel.levelModel.mini.at(0)?.id,
			mons: data.nextLevel.levelModel.mons.at(0)?.id,
		};
	};
	// [ #3 ] ======================================================================================================
}

type CurrentLevelData = {
	[key: string]: {
		asNumber: number;
		levelModel: GuideLevelModel;
		levelExpBonus: number;
	};
};

// Export as a worker
if (!worker.isMainThread) {
	worker.parentPort.on("message", (level) => {
		new LevelGuide(level)
			.generate()
			.then((res) => {
				worker.parentPort.postMessage(JSON.stringify(res));
			})
			.catch(console.error);
	});
}
