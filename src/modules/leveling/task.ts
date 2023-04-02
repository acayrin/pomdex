import "colors";
import fastq from "fastq";
import { App } from "../app.js";
import { PomdexCollection } from "../database/init.js";
import Utils from "../utils/index.js";
import { ToramMonster } from "../_types/monster.js";
import { getLevelGuide } from "./getLevelGuide.js";
import { monsterListPool } from "./getMonsterList.js";

export const preloadLevelModelList: ToramMonster[] = [];
export const preloadLevelModels = async () => {
	preloadLevelModelList.push(
		...((await PomdexCollection.find({
			type: {
				$in: [new RegExp("boss", "gi"), new RegExp("monster", "gi")],
			},
		}).toArray()) as ToramMonster[])
	);

	Utils.info("LEVEL".cyan, `Loaded ${preloadLevelModelList.length} monster entries`.green);

	const timerStart = Date.now();
	const levelArray = Array(Math.ceil((500 - 1) / 50))
		.fill(1)
		.map((x, y) => x + y * 50);
	const queue = fastq.promise(getLevelGuide, App.MaxConcurrency);

	await Promise.all(levelArray.map((level) => queue.push(`${level} ${level + 50}`)));

	// clean up
	preloadLevelModelList.length = 0;
	await queue.killAndDrain();
	await monsterListPool.terminate();

	Utils.info(
		"LEVEL".cyan,
		"Loaded all level model(s)".green,
		`Took ${((Date.now() - timerStart) / 1e3).toFixed(2)}s`.green
	);
};

export const benchmarkLevelModel = async () => {
	const taskMap = new Map<string, Function>();

	taskMap.set("199 200", getLevelGuide);
	taskMap.set("100 200", getLevelGuide);
	taskMap.set("1 200", getLevelGuide);

	for (const [task, func] of taskMap.entries()) {
		Utils.info(`Running ${task}`);

		const timeArray: number[] = [];
		for (let i = 0; i <= 1e3; i++) {
			const timeStart = Date.now();
			await func(task);
			timeArray.push(Date.now() - timeStart);
		}
		let avgTime = 0;
		for (const time of timeArray) avgTime += time;
		Utils.info(
			task.cyan,
			`Avg ${(avgTime / timeArray.length).toFixed(2)}`,
			`Min ${Math.min(...timeArray)}`,
			`Max ${Math.max(...timeArray)}`
		);
	}
};
