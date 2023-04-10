import { GuideResultListEntryItem } from "./index.js";

export type GuideResultListEntry = {
	startLevel: number;
	endLevel: number;
	bonusExp: number;
	boss: GuideResultListEntryItem[];
	mini: GuideResultListEntryItem[];
	mons: GuideResultListEntryItem[];
};
