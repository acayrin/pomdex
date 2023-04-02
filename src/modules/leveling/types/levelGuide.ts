export type GuideLevelModelEntry = {
	id: string;
	name: string;
	exp: number;
	expWithBonus: number;
	type: string;
	level: number;
	map: string;
	count: number;
	countWithoutBonus: number;
};

export type GuideLevelModel = {
	boss: GuideLevelModelEntry[];
	mini: GuideLevelModelEntry[];
	mons: GuideLevelModelEntry[];
	unified: GuideLevelModelEntry[];
};

export type GuideResultError = {
	type: 3;
	pm?: boolean;
	err: string;
};

export type GuideResultListEntryItem = {
	id: string;
	name: string;
	type: string;
	level: number;
	exp: number;
	map: string;
	preserve: boolean;
	count: number;
	countWithoutBonus: number;
};

export type GuideResultListEntry = {
	startLevel: number;
	endLevel: number;
	bonusExp: number;
	boss: GuideResultListEntryItem[];
	mini: GuideResultListEntryItem[];
	mons: GuideResultListEntryItem[];
};

export type GuideResult = {
	type: 2;
	pm?: boolean;
	pr?: number;
	startLevel: number;
	endLevel: number;
	totalExp: number;
	bonusExp: number;
	list: GuideResultListEntry[];
};

export type GuideResults = GuideResult | GuideResultError;
