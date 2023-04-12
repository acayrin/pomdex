import * as Toram from "../../../toram.json" assert { type: "json" };

/**
 * Calculate EXP bonus for given level,
 * assuming that the player has already unlocked every leveling emblems
 *
 * @param inputLevel Target level
 * @param playerMaxLevel Player's highest character level
 * @param withDailies Whether to add 50% daily EXP bonus
 * @returns Total EXP bonus
 */
export const calculateExpBonus = (inputLevel: number, playerMaxLevel: number, withDailies: boolean = false): number => {
	let totalBonus = withDailies ? 50 : 0;
	const targetLevel = inputLevel + 1;

	for (
		let levelCap = playerMaxLevel || Toram.default.leveling.levelCap || 500;
		levelCap >= targetLevel;
		levelCap -= 5
	) {
		if (levelCap && levelCap > 0 && levelCap % 30 === 0 && (targetLevel || 0 < levelCap - 1))
			totalBonus += 9 + levelCap / 30;
	}

	return totalBonus;
};
