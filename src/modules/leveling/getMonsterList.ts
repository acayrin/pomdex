import workerpool from "workerpool";
import { App } from "../app.js";
import { ToramMonster } from "../_types/monster.js";
import { preloadLevelModelList } from "./task.js";

export const monsterListPool = workerpool.pool({
	maxWorkers: App.MaxConcurrency,
});
export const getMonsterList = async (
	level: number,
	bonus: number
): Promise<{ monster: ToramMonster; expWithBonus: number; expWithoutBonus: number }[]> =>
	new Promise((resolve, reject) => {
		monsterListPool
			.exec(_getMonsterList, [
				{
					list: preloadLevelModelList,
					level,
					bonus,
				},
			])
			.then(resolve)
			.catch(reject);
	});

const _getMonsterList = (opts: {
	list: ToramMonster[];
	level: number;
	bonus: number;
}): { monster: ToramMonster; expWithBonus: number; expWithoutBonus: number }[] => {
	// results list
	const results: {
		monster: ToramMonster;
		expWithBonus: number;
		expWithoutBonus: number;
	}[] = [];

	// variables
	for (const monsterEntry of opts.list) {
		// ignore event/missing data mobs
		if (!Number(monsterEntry.exp) || monsterEntry.level === 0 || /event/gi.test(monsterEntry.map)) {
			continue;
		}

		const monsterLevel = Number(monsterEntry.level) ? Number(monsterEntry.level) : 1;
		const monsterExp = Number(monsterEntry.exp) ? Number(monsterEntry.exp) : 1;
		const bonusExp = 1 + (opts.bonus || 0) / 100;

		if (Math.abs(monsterLevel - opts.level) < 10) {
			// only allow if level difference is less than 10
			const expMultiplier =
				Math.abs(monsterLevel - opts.level) <= 5
					? 11
					: Math.abs(monsterLevel - opts.level) <= 6
					? 10
					: Math.abs(monsterLevel - opts.level) <= 7
					? 9
					: Math.abs(monsterLevel - opts.level) <= 8
					? 7
					: Math.abs(monsterLevel - opts.level) <= 9
					? 3
					: 1;

			results.push({
				monster: monsterEntry,
				expWithBonus: Math.round(monsterExp * expMultiplier * bonusExp),
				expWithoutBonus: Math.round(monsterExp * expMultiplier),
			});
		}
	}

	return results.sort((e1, e2) => e2.expWithBonus - e1.expWithBonus);
};

export const getMonsterLevelInfo = (monster: ToramMonster, level: number, bonusExp?: number) => {
	const expBase = Number(monster.exp) || 0;
	const expMultiplier =
		Math.abs(monster.level - level) <= 5
			? 11
			: Math.abs(monster.level - level) <= 6
			? 10
			: Math.abs(monster.level - level) <= 7
			? 9
			: Math.abs(monster.level - level) <= 8
			? 7
			: Math.abs(monster.level - level) <= 9
			? 3
			: 1;

	return {
		monster,
		expWithBonus: Math.round(expBase * expMultiplier * (1 + (bonusExp || 0) / 100)),
		expWithoutBonus: Math.round(expBase * expMultiplier),
	};
};
