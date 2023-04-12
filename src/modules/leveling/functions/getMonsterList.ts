import { PomdexCollection } from "../../database/index.js";
import { ToramMonster } from "../../types/index.js";

const list = (await PomdexCollection.find({
	type: {
		$in: [/boss/gi, /monster/gi],
	},
}).toArray()) as ToramMonster[];
const getMonsterListOfLevel = async (opts: {
	level: number;
	bonus: number;
}): Promise<{ monster: ToramMonster; expWithBonus: number; expWithoutBonus: number }[]> => {
	// results list
	const results: {
		monster: ToramMonster;
		expWithBonus: number;
		expWithoutBonus: number;
	}[] = [];

	for (const entry of list) {
		if (!entry.exp) continue;

		const data = getMonsterInfoByLevel(entry, opts.level, opts.bonus);
		if (data) results.push(data);
	}

	return results.sort((e1, e2) => e2.expWithBonus - e1.expWithBonus);
};

const getMonsterInfoByLevel = (monster: ToramMonster, level: number, bonusExp = 1) => {
	const monsterLevel = Number(monster.level) || 1;
	const monsterExp = Number(monster.exp) || 1;
	const levelDifference = Math.abs(monsterLevel - level);

	if (levelDifference < 10) {
		// only allow if level difference is less than 10
		let expMultiplier = 3;
		if (levelDifference <= 5) expMultiplier = 11;
		else if (levelDifference <= 6) expMultiplier = 10;
		else if (levelDifference <= 7) expMultiplier = 9;
		else if (levelDifference <= 8) expMultiplier = 7;

		return {
			monster,
			expWithBonus: Math.round(monsterExp * expMultiplier * (1 + Number(bonusExp) / 100)),
			expWithoutBonus: Math.round(monsterExp * expMultiplier),
		};
	} else {
		return undefined;
	}
};

export { getMonsterListOfLevel, getMonsterInfoByLevel };
