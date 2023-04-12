import { Worker } from "../LevelGuideWorker.js";
import { GuideResultError } from "../types/index.js";

const extraDisplayMaxCount = 3;

export const printGuide = async (args: string, raw: boolean = true) => {
	const guideResult = await Worker.requestLevelGuide(args);
	const guideFile: string[] = [];

	// if error was found
	if (guideResult.type === 3) {
		return { type: 3, error: guideResult.error } as GuideResultError;
	}

	if (raw) {
		return guideResult;
	}

	guideFile.push(
		`Exp required for ${guideResult.startLevel} > ${guideResult.endLevel}: ${guideResult.totalExp.toLocaleString()}`
	);
	if (guideResult.bonusExp) {
		guideFile.push(`Exp bonus +${guideResult.bonusExp}%`);
	}

	for (const entry of guideResult.list) {
		guideFile.push(" ");
		guideFile.push(
			`[Phase #${guideResult.list.indexOf(entry) + 1}] ${entry.startLevel} > ${entry.endLevel} (+${
				entry.bonusExp || guideResult.bonusExp
			}%)`
		);
		guideFile.push(" │");
		if (entry.boss?.length < 1 && entry.mini?.length < 1 && entry.mons?.length < 1)
			guideFile.push("[No data available for this phase]");

		if (entry.boss?.length > 0) {
			const mainEntry = entry.boss.shift();
			guideFile.push(` ${entry.mini || entry.mons ? "├" : "└"}─ [${mainEntry.id}] ${mainEntry.name}`);
			guideFile.push(` ${entry.mini || entry.mons ? "│" : " "}   │`);
			guideFile.push(
				` ${entry.mini || entry.mons ? "│" : " "}   ${entry.boss.length > 0 ? "├" : "└"}── Level ${
					mainEntry.level
				} - ${mainEntry.type}`
			);
			guideFile.push(
				` ${entry.mini || entry.mons ? "│" : " "}   ${entry.boss.length > 0 ? "│" : " "}   Defeats: ${
					mainEntry.count
				} - ${mainEntry.countWithoutBonus} times`
			);
			guideFile.push(` ${entry.mini || entry.mons ? "│" : " "}   ${entry.boss.length > 0 ? "│" : " "}`);
			guideFile.push(` ${entry.mini || entry.mons ? "│" : " "}   ${entry.boss.length > 0 ? "└── [Others]" : ""}`);

			if (entry.boss.length > 0) {
				let extraEntry: {
					id: string;
					name: string;
					level: number;
					type: string;
					count?: number;
					countWb?: number;
				};
				let extraDisplayCount = 0;
				while ((extraEntry = entry.boss.shift()) && extraDisplayCount < extraDisplayMaxCount) {
					if (!extraEntry) continue;
					extraDisplayCount++;
					guideFile.push(` ${entry.mini || entry.mons ? "│" : " "}        │`);
					guideFile.push(
						` ${entry.mini || entry.mons ? "│" : " "}       [${extraEntry.id}] ${extraEntry.name}`
					);
					guideFile.push(` ${entry.mini || entry.mons ? "│" : " "}        │`);
					guideFile.push(
						` ${entry.mini || entry.mons ? "│" : " "}        ${
							entry.boss.length > 0 && extraDisplayCount < extraDisplayMaxCount ? "├" : "└"
						}── Level ${extraEntry.level} - ${extraEntry.type}`
					);
				}
			}

			guideFile.push(` ${entry.mini || entry.mons ? "│" : ""}`);
		}

		if (entry.mini?.length > 0) {
			const mainEntry = entry.mini.shift();
			guideFile.push(` ${entry.mons ? "├" : "└"}─ [${mainEntry.id}] ${mainEntry.name}`);
			guideFile.push(` ${entry.mons ? "│" : " "}   │`);
			guideFile.push(
				` ${entry.mons ? "│" : " "}   ${entry.mini.length > 0 ? "├" : "└"}── Level ${mainEntry.level} - ${
					mainEntry.type
				}`
			);
			guideFile.push(
				` ${entry.mons ? "│" : " "}   ${entry.mini.length > 0 ? "│" : " "}   Defeats: ${mainEntry.count} - ${
					mainEntry.countWithoutBonus
				} times`
			);
			guideFile.push(` ${entry.mons ? "│" : " "}   ${entry.mini.length > 0 ? "│" : " "}`);
			guideFile.push(` ${entry.mons ? "│" : " "}   ${entry.mini.length > 0 ? "└── [Others]" : ""}`);

			if (entry.mini.length > 0) {
				let extraEntry: {
					id: string;
					name: string;
					level: number;
					type: string;
					count?: number;
					countWb?: number;
				};
				let extraDisplayCount = 0;
				while ((extraEntry = entry.mini.shift()) && extraDisplayCount < extraDisplayMaxCount) {
					if (!extraEntry) continue;
					extraDisplayCount++;
					guideFile.push(` ${entry.mons ? "│" : " "}        │`);
					guideFile.push(` ${entry.mons ? "│" : " "}       [${extraEntry.id}] ${extraEntry.name}`);
					guideFile.push(` ${entry.mons ? "│" : " "}        │`);
					guideFile.push(
						` ${entry.mons ? "│" : " "}        ${
							entry.mini.length > 0 && extraDisplayCount < extraDisplayMaxCount ? "├" : "└"
						}── Level ${extraEntry.level} - ${extraEntry.type}`
					);
				}
			}

			guideFile.push(` ${entry.mons ? "│" : ""}`);
		}

		if (entry.mons?.length > 0) {
			const mainEntry = entry.mons.shift();
			guideFile.push(` └─ [${mainEntry.id}] ${mainEntry.name}`);
			guideFile.push("     │");
			guideFile.push(`     ${entry.mons.length > 0 ? "├" : "└"}── Level ${mainEntry.level} - ${mainEntry.type}`);
			guideFile.push(
				`     ${entry.mons.length > 0 ? "│" : " "}   Defeats: ${mainEntry.count} - ${
					mainEntry.countWithoutBonus
				} times`
			);
			guideFile.push(`     ${entry.mons.length > 0 ? "│" : " "}`);
			guideFile.push(`     ${entry.mons.length > 0 ? "└── [Others]" : ""}`);

			if (entry.mons.length > 0) {
				let extraEntry: {
					id: string;
					name: string;
					level: number;
					type: string;
					count?: number;
					countWb?: number;
				};
				let extraDisplayCount = 0;
				while ((extraEntry = entry.mons.shift()) && extraDisplayCount < extraDisplayMaxCount) {
					if (!extraEntry) continue;
					extraDisplayCount++;
					guideFile.push("          │");
					guideFile.push(`         [${extraEntry.id}] ${extraEntry.name}`);
					guideFile.push("          │");
					guideFile.push(
						`          ${
							entry.mons.length > 0 && extraDisplayCount < extraDisplayMaxCount ? "├" : "└"
						}── Level ${extraEntry.level} - ${extraEntry.type}`
					);
				}
			}
		}
	}

	return guideFile.join("\n");
};
