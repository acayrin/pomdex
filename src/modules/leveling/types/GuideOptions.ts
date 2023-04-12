export type GuideOptions = {
	expBonus?: number;
	playerMaxLevel?: number;
	monsterFilter?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	preserveRanking?: number;
	includeEventMonsters?: boolean;
	skipCache?: boolean;

	_levelStart: number;
	_levelEnd: number;
	_levelArray?: number[];
};
