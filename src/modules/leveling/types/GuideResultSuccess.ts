import { GuideResultListEntry } from "./index.js";

export type GuideResultSuccess = {
	type: 2;
	pr?: number;
	startLevel: number;
	endLevel: number;
	totalExp: number;
	bonusExp: number;
	list: GuideResultListEntry[];
};
