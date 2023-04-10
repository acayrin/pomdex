import async from "async";
import "colors";
import { App } from "../app.js";
import { PomdexCollection } from "../database/index.js";
import { ToramMonster } from "../types/ToramMonster.js";
import Utils from "../utils/index.js";
import { getLevelGuide } from "./getLevelGuide.js";
import { monsterListWorkerPool } from "./getMonsterList.js";

let tempWorkQueue: async.QueueObject<string>;
const preloadLevelMonsterList: ToramMonster[] = [];
const taskPreloadLevelModels = () =>
	async.waterfall(
		[
			(next: (error: Error, ...args: any) => void) => {
				PomdexCollection.find({
					type: {
						$in: [/boss/gi, /monster/gi],
					},
				})
					.toArray()
					.then((monsterList) => {
						preloadLevelMonsterList.push(...(monsterList as ToramMonster[]));

						next(null);
					});
			},

			(next: (error: Error, ...args: any) => void) => {
				tempWorkQueue = async.queue((level, n) => {
					getLevelGuide(level).then(() => n(null));
				}, App.MaxConcurrency);

				for (const level of Array(Math.ceil((500 - 1) / 50))
					.fill(1)
					.map((x, y) => x + y * 50)) {
					tempWorkQueue.push(`${level} ${level + 50}`);
				}

				next(null);
			},
		],
		(error) => {
			tempWorkQueue.drain(() => {
				// clean up
				preloadLevelMonsterList.length = 0;
				tempWorkQueue.kill();
				monsterListWorkerPool
					.terminate()
					.then(() => Utils.info("LEVEL".cyan, "Loaded all level model(s)".green));
			});
		}
	);

export { taskPreloadLevelModels, preloadLevelMonsterList };
