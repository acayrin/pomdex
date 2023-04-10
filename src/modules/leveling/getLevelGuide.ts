import zlib from "zlib";
import * as Toram from "../../toram.json" assert { type: "json" };
import { ToramMonster } from "../types/ToramMonster.js";
import Utils from "../utils/index.js";
import { calculateExpBonus } from "./calculateBonusExp.js";
import { calculateExpAmount } from "./calculateExpAmount.js";
import { getMonsterInfoByLevel, getMonsterListOfLevel } from "./getMonsterList.js";
import { GuideLevelModel, GuideResult, GuideResultListEntry, GuideResultListEntryItem } from "./types/index.js";

// store monster/battle data per level - level model
const pomieLevelModels: { [key: number]: Buffer } = {};
const monsterTypes = ["boss", "mini", "mons"];

/**
 * Generates a leveling guide based on given arguments
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
 * @param {String} args arguments
 * @returns Object containing leveling guide
 */
export const getLevelGuide = async (args: string): Promise<GuideResult> => {
	// [ TASK 1 ]===================================================================================
	// missing arguments
	if (!args) {
		return {
			type: 3,
			error: "Missing arguments",
		};
	}

	// basic guide variables
	let guideBonus: number;
	let guideFilter: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	let guidePreserveRanking: number;
	let guideIncludeEvents = false;
	let guidePlayerMaxLevel: number = undefined;
	let skipCache = false;
	// level mapping, store as
	// key: <Level num>
	// value: corresponding boss/miniboss/normal monster of that level
	const levelMap: {
		[key: number]: GuideLevelModel;
	} = {};

	// prevent negative values
	const secondArg = args.split(" ")[1];
	let startLevel = Math.abs(Number(args.split(" ")[0]));
	let endLevel = secondArg ? Math.abs(Number(secondArg)) : startLevel + 1;
	// if end level is equals to start level
	if (endLevel === startLevel) endLevel = startLevel + 1;
	// reverse if numbers are opposite
	if (endLevel && endLevel < startLevel) {
		const swap = endLevel;
		endLevel = startLevel;
		startLevel = swap;
	}

	// array of levels
	const levelArray = Utils.range(startLevel, endLevel + 1);

	// filter through arguments and assign values
	const partials = args.split(" ");
	for (const partial of partials) {
		switch (partial) {
			case "-e":
			case "--exp": {
				const value = partials[partials.indexOf(partial) + 1];
				if (value && !Number.isNaN(value)) {
					guideBonus = Number(value);
				}
				break;
			}
			case "-b":
			case "--boss":
				guideFilter = 1;
				break;
			case "-m":
			case "--mini":
				guideFilter = 2;
				break;
			case "-n":
			case "--normal":
				guideFilter = 3;
				break;
			case "-h":
			case "--hard":
				guideFilter = 4;
				break;
			case "-nm":
			case "--nightmare":
				guideFilter = 5;
				break;
			case "-u":
			case "--ultimate":
				guideFilter = 6;
				break;
			case "-M":
			case "--mob":
				guideFilter = 7;
				break;
			case "-ev":
			case "--event":
				guideIncludeEvents = true;
				break;
			case "-pr":
			case "--preserve": {
				const value = partials[partials.indexOf(partial) + 1];
				if (value && !Number.isNaN(value)) {
					guidePreserveRanking = Number(value);
				}
				break;
			}
			case "-lm":
			case "--level-limit": {
				const value = partials[partials.indexOf(partial) + 1];
				if (value && !Number.isNaN(value)) {
					guidePlayerMaxLevel = Number(value);
				}
				break;
			}
			// hidden option
			case "--skip-cache": {
				skipCache = true;
			}
		}
	}

	// base guide result
	const guideResult: GuideResult = {
		type: 2,
		pr: guidePreserveRanking,
		startLevel,
		endLevel,
		totalExp: calculateExpAmount(startLevel, endLevel),
		bonusExp: guideBonus > 0 ? guideBonus : undefined,
		list: [],
	};

	/** [ TASK 2 ]=====================================================================================
	 * Generate a model per level and assign to base map
	 */
	for (const level of levelArray) {
		let levelModel: GuideLevelModel = {
			boss: [],
			mini: [],
			mons: [],
			unified: [],
		};

		// if level model exists and exp bonus is unchanged
		if (!skipCache && pomieLevelModels[level]) {
			levelModel = JSON.parse(zlib.gunzipSync(pomieLevelModels[level], { level: 9 }).toString());
		} else {
			// get current level exp bonus
			const currentLevelBonus =
				(guideBonus || 0) + calculateExpBonus(level, guidePlayerMaxLevel, guideBonus === undefined);
			// get current level mob list
			const currentLevelList = await getMonsterListOfLevel(level, currentLevelBonus);

			// get current level mob entries
			for (const entry of currentLevelList) {
				const entryModel = {
					id: entry.monster.id,
					name: entry.monster.name,
					level: entry.monster.level,
					exp: entry.monster.exp,
					expWithBonus: entry.expWithBonus,
					type: entry.monster.type,
					map: entry.monster.map,
					count: Math.ceil(calculateExpAmount(level) / entry.expWithBonus),
					countWithoutBonus: Math.ceil(calculateExpAmount(level) / entry.expWithoutBonus),
				};

				levelModel.unified.push(entryModel);

				if (entry.monster.type.startsWith("Boss -")) levelModel.boss.push(entryModel);
				if (entry.monster.type.startsWith("Mini")) levelModel.mini.push(entryModel);
				if (entry.monster.type.startsWith("Mons")) levelModel.mons.push(entryModel);
			}
			// release array
			currentLevelList.length = 0;

			// store base model to global mapping if no guide bonus was applied
			if (!guideBonus) {
				pomieLevelModels[level] = zlib.gzipSync(JSON.stringify(levelModel), {
					level: 9,
				});
			}
		}

		// filter monsters by type
		// any boss
		if ([1, 3, 4, 5, 6].includes(guideFilter)) {
			levelModel.mini = [];
			levelModel.mons = [];
		}
		switch (guideFilter) {
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
		levelMap[level] = levelModel;
	}

	/** [ DATA STORE ]===============================================================================
	 * store data per level range
	 * reset when condition(s) are met
	 */
	const levelRangeData: {
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
	} = {
		fixedLevel: startLevel,
		boss: {},
		mini: {},
		mons: {},
		preserveRankings: {
			boss: levelMap[startLevel].boss.at(0)?.id,
			mini: levelMap[startLevel].mini.at(0)?.id,
			mons: levelMap[startLevel].mons.at(0)?.id,
		},
	};

	/** [ MAIN ]===================================================================================
	 * Loop through all the levels
	 * and stack up data if nothing changes accordingly or
	 * split up and assign accumulated data to guide results
	 */
	for (const level of levelArray) {
		// current level data
		const currentLevel = {
			// level number
			asNumber: level,
			// level monster data
			levelModel: levelMap[level],
			// level exp bonus %
			levelExpBonus: (guideBonus || 0) + calculateExpBonus(level, undefined, guideBonus === undefined),
		};

		// next level data
		const nextLevel = {
			// level number
			asNumber: level + 1,
			// level monster data
			levelModel: levelMap[level + 1],
			// level exp bonus %
			levelExpBonus:
				(guideBonus || 0) + calculateExpBonus(level + 1, guidePlayerMaxLevel, guideBonus === undefined),
		};

		// if next level data doesn't exist, ignore
		if (!nextLevel.levelModel) continue;

		// stack up monster entry battle count
		for (let i = currentLevel.levelModel.unified.length - 1; i >= 0; i--) {
			const monster = currentLevel.levelModel.unified[i];

			// calculate base battle count with bonus applied
			// since each level model stays the same, only diff is the exp bonus applies to it
			const battleCountWithBonusBase = Math.ceil(
				calculateExpAmount(level) /
					getMonsterInfoByLevel(monster as unknown as ToramMonster, level, currentLevel.levelExpBonus)
						.expWithBonus
			);

			// loop through monster type and run task depends on current monster entry type
			for (const type of monsterTypes) {
				// ignore this loop if type does match with entrys
				if (!monster.type.toLowerCase().startsWith(type)) {
					continue;
				}

				// assign monster data to monster type map if not found
				levelRangeData[type][monster.id] ||= {
					battleCountWithBonus: 0,
					battleCountWithoutBonus: 0,
				};

				// if custom guide bonus applied and base battle count with bonus > 0
				if (guideBonus && battleCountWithBonusBase > 0)
					levelRangeData[type][monster.id].battleCountWithBonus += battleCountWithBonusBase;

				// if model count with exp bonus > 0
				if (monster.count > 0) levelRangeData[type][monster.id].battleCountWithBonus += monster.count;

				// if model count without exp bonus > 0
				if (monster.countWithoutBonus > 0)
					levelRangeData[type][monster.id].battleCountWithoutBonus += monster.countWithoutBonus;

				// set battle count to 1 if any number is 0
				if (levelRangeData[type][monster.id].battleCountWithBonus === 0)
					levelRangeData[type][monster.id].battleCountWithBonus = 1;
				if (levelRangeData[type][monster.id].battleCountWithoutBonus === 0)
					levelRangeData[type][monster.id].battleCountWithoutBonus = 1;
			}
		}
		// release array
		currentLevel.levelModel.unified.length = 0;

		// difference validation between 2 levels
		const validate = {
			// if 2 levels have different ranked monster entry
			differentMonster:
				currentLevel.levelModel.boss?.[0]?.id !== nextLevel.levelModel.boss?.[0]?.id ||
				currentLevel.levelModel.mini?.[0]?.id !== nextLevel.levelModel.mini?.[0]?.id ||
				currentLevel.levelModel.mons?.[0]?.id !== nextLevel.levelModel.mons?.[0]?.id,

			// if 2 different level state
			differentLevel: currentLevel.asNumber !== levelRangeData.fixedLevel,

			// if 2 levels have different exp bonus
			differentExpBonus:
				calculateExpBonus(currentLevel.asNumber, guidePlayerMaxLevel) !==
				calculateExpBonus(nextLevel.asNumber, guidePlayerMaxLevel),

			// if current loop is at last level
			atLastLevel: currentLevel.asNumber + 1 === endLevel,

			// if preserve rankings is applied, set rankings to this fixed level highest ranking monster of each type
			preserveRanking: {
				boss: nextLevel.levelModel.boss
					?.slice(0, guidePreserveRanking)
					?.find((z) => levelRangeData.preserveRankings.boss === z.id)?.id,
				mini: nextLevel.levelModel.mini
					?.slice(0, guidePreserveRanking)
					?.find((z) => levelRangeData.preserveRankings.mini === z.id)?.id,
				mons: nextLevel.levelModel.mons
					?.slice(0, guidePreserveRanking)
					?.find((z) => levelRangeData.preserveRankings.mons === z.id)?.id,
			},
		};

		// continue the loop to next level if validation fails (aka nothing changed);
		if (
			!(
				validate.atLastLevel ||
				(validate.differentLevel && validate.differentExpBonus) ||
				(!guidePreserveRanking && validate.differentMonster) ||
				(guidePreserveRanking &&
					!validate.preserveRanking.boss &&
					!validate.preserveRanking.mini &&
					!validate.preserveRanking.mons)
			)
		) {
			continue;
		}

		// final level range result
		const levelRangeResult: GuideResultListEntry = {
			// bonus exp % applied to this range
			bonusExp:
				(guideBonus || 0) +
				calculateExpBonus(currentLevel.asNumber, guidePlayerMaxLevel, guideBonus === undefined),

			// starting level of this range
			startLevel: levelRangeData.fixedLevel,

			// final level of this range
			endLevel: currentLevel.asNumber,

			// list of monster entries, only for show, assignment see below
			boss: [],
			mini: [],
			mons: [],
		};

		// loop through monster types and assign each type the mapped data and assign to the final result
		for (const type of monsterTypes) {
			levelRangeResult[type] = (currentLevel.levelModel[type] as GuideResultListEntryItem[]).map((entry) => {
				return {
					id: entry.id,
					type: entry.type,
					name: entry.name,
					level: entry.level,
					exp: entry.exp,
					map: entry.map,
					preserve: guidePreserveRanking && entry.id === levelRangeData.preserveRankings.boss,
					count: levelRangeData[type][entry.id].battleCountWithBonus,
					countWithoutBonus: levelRangeData[type][entry.id].battleCountWithoutBonus,
				};
			});
		}

		/**
		 * Sanitize this level range entry to remove "illegal" monster entries
		 * such as monster level is above limit comparing to start level,
		 * also re-order the result arrays by battle count with exp bonus applied
		 */
		for (const type of monsterTypes) {
			const sanitizedArray: GuideResultListEntryItem[] = [];

			for (const entry of levelRangeResult[type] as GuideResultListEntryItem[]) {
				if (
					// if entries are outside level bonus range
					entry?.level - levelRangeResult.startLevel > 9 ||
					// include event-limited monsters
					(!guideIncludeEvents &&
						// included in ignored name/id list
						Toram.default.leveling.ignoredList.byName.some(
							(name) =>
								name.toUpperCase().includes(entry.id) ||
								entry?.name?.toLowerCase().includes(name.toLowerCase())
						)) ||
					// included in ignored map list
					(!guideIncludeEvents &&
						Toram.default.leveling.ignoredList.byMap.some((map) => new RegExp(map, "i").test(entry.map)))
				) {
					continue;
				}

				sanitizedArray.push(entry);
			}

			levelRangeResult[type] = sanitizedArray.sort((r1, r2) => r1.count - r2.count);
		}

		// push sanitized result to list;
		guideResult.list.push(levelRangeResult);

		// flush all data for next level
		levelRangeData.fixedLevel = nextLevel.asNumber;
		levelRangeData.boss = {};
		levelRangeData.mini = {};
		levelRangeData.mons = {};
		levelRangeData.preserveRankings = {
			boss: nextLevel.levelModel.boss.at(0)?.id,
			mini: nextLevel.levelModel.mini.at(0)?.id,
			mons: nextLevel.levelModel.mons.at(0)?.id,
		};
	}

	// return final guide result
	return guideResult;
	// [ END ]===================================================================================
};
