import workerpool from "workerpool";
import { App } from "../app.js";
import { ToramMonster } from "../types/index.js";
import { preloadLevelMonsterList } from "./preloadLevelModels.js";

const monsterListWorkerPool = workerpool.pool({
	maxWorkers: App.MaxConcurrency,
});
const getMonsterListOfLevel = async (
	level: number,
	bonus: number
): Promise<{ monster: ToramMonster; expWithBonus: number; expWithoutBonus: number }[]> =>
	new Promise((resolve, reject) => {
		monsterListWorkerPool
			.exec(workerGetMonsterList, [
				{
					list: preloadLevelMonsterList,
					level,
					bonus,
				},
			])
			.then(resolve)
			.catch(reject);
	});

const workerGetMonsterList = (opts: {
	list: ToramMonster[];
	level: number;
	bonus: number;
}): { monster: ToramMonster; expWithBonus: number; expWithoutBonus: number }[] => {
	// duplicate - for use within another worker process
	const getMonsterInfoByLevel = (monster: ToramMonster, level: number, bonusExp?: number) => {
		const monsterLevel = Number(monster.level) || 1;
		const monsterExp = Number(monster.exp) || 1;
		const levelDifference = Math.abs(monsterLevel - level);

		if (levelDifference < 10) {
			// only allow if level difference is less than 10
			let expMultiplier = 11;
			if (levelDifference >= 6) expMultiplier = 10;
			if (levelDifference >= 7) expMultiplier = 9;
			if (levelDifference >= 8) expMultiplier = 7;
			if (levelDifference >= 9) expMultiplier = 3;

			return {
				monster,
				expWithBonus: Math.round(monsterExp * expMultiplier * (1 + (bonusExp || 0) / 100)),
				expWithoutBonus: Math.round(monsterExp * expMultiplier),
			};
		} else {
			return undefined;
		}
	};

	// results list
	const results: {
		monster: ToramMonster;
		expWithBonus: number;
		expWithoutBonus: number;
	}[] = [];
	const bonusExp = 1 + (opts.bonus || 0) / 100;

	// variables
	for (const entry of opts.list) {
		if (!entry.exp) continue;

		const data = getMonsterInfoByLevel(entry, opts.level, bonusExp);
		if (data) results.push(data);
	}

	return results.sort((e1, e2) => e2.expWithBonus - e1.expWithBonus);
};

const getMonsterInfoByLevel = (monster: ToramMonster, level: number, bonusExp?: number) => {
	const monsterLevel = Number(monster.level) || 1;
	const monsterExp = Number(monster.exp) || 1;
	const levelDifference = Math.abs(monsterLevel - level);

	if (levelDifference < 10) {
		// only allow if level difference is less than 10
		let expMultiplier = 11;
		if (levelDifference >= 6) expMultiplier = 10;
		if (levelDifference >= 7) expMultiplier = 9;
		if (levelDifference >= 8) expMultiplier = 7;
		if (levelDifference >= 9) expMultiplier = 3;

		return {
			monster,
			expWithBonus: Math.round(monsterExp * expMultiplier * (1 + (bonusExp || 0) / 100)),
			expWithoutBonus: Math.round(monsterExp * expMultiplier),
		};
	} else {
		return undefined;
	}
};

export { monsterListWorkerPool, getMonsterListOfLevel, getMonsterInfoByLevel };
