import * as Toram from "../../toram.json" assert { type: "json" };

export const calculateExpBonus = (inputLevel: number, withDailies: boolean = false): number => {
	let totalBonus = withDailies ? 50 : 0;
	const targetLevel = inputLevel + 1;

	for (let levelCap = Toram.default.leveling.levelCap || 500; levelCap >= targetLevel; levelCap -= 5)
		if (levelCap && levelCap > 0 && levelCap % 30 === 0 && (targetLevel || 0 < levelCap - 1))
			totalBonus += 9 + levelCap / 30;

	return totalBonus;
};
