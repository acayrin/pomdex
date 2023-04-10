/**
 * Calculate total EXP amount of given level range
 *
 * Original source by Lorem:
 * @link https://toramonline.com/index.php?threads/little-experience-experiment.5598/
 *
 * @param baseLevel Base level
 * @param targetLevel Target level
 * @returns Total EXP amount
 */
export const calculateExpAmount = (baseLevel: number, targetLevel: number = baseLevel + 1) => {
	let totalExp = 0;

	while (targetLevel >= baseLevel) {
		totalExp = 0.025 * baseLevel ** 4 + 2 * baseLevel;
		baseLevel++;
	}

	return Math.floor(totalExp);
};
