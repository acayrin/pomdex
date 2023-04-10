import async, { QueueObject } from "async";
import "colors";
import { App } from "../app.js";
import { PomdexCollection } from "../database/index.js";
import { ToramObject } from "../types/index.js";
import Utils from "../utils/index.js";
import { scrapeItem } from "./scrapeItem.js";
import { scrapeMap } from "./scrapeMap.js";
import { scrapeMonster } from "./scrapeMonster.js";

export const scrapeAll = async () => {
	const notFoundIDs: string[] = [];
	const scrape = {
		map: scrapeMap,
		item: scrapeItem,
		monster: scrapeMonster,
	};
	const queues: {
		[key: string]: QueueObject<{ id: number }>;
	} = {};

	for (const type of ["map", "item", "monster"]) {
		queues[type] = async.queue<{ id: number }>(
			(data, done) =>
				// prettier-ignore
				(scrape[type] as typeof scrapeItem
					| typeof scrapeMonster
					| typeof scrapeMap
				)(data.id)
					.then((res: ToramObject) => {
						PomdexCollection.deleteMany({
							id: res.id,
						}).then(() =>
							PomdexCollection.insertOne(res).then(() => {
								Utils.info(`Saved ${res.id}`.green);

								done(null);
							})
						);
					})
					.catch(() => {
						Utils.error(`Not found ${type.slice(0, 1).toUpperCase()}${data.id}`.red);
						notFoundIDs.push(`${type.slice(0, 1).toUpperCase()}${data.id}`);

						done(null);
					}),
			App.MaxConcurrency
		);
	}

	async.parallel(
		["map", "item", "monster"].map((type) => (done) => {
			let regex: RegExp;
			switch (type) {
				case "monster": {
					regex = /(monster)|(boss)/i;
					break;
				}
				case "map": {
					regex = /map/i;
					break;
				}
				default: {
					regex = /^((?!monster|map|item).)*$/i;
				}
			}

			PomdexCollection.countDocuments({
				type: {
					$regex: regex,
				},
			}).then((count) => {
				Utils.info(`Checking ${type} count ${count} / ${Math.floor(count + count * 0.1)}`.green);

				for (let id = Math.floor(count + count * 0.1); id > 0; id--) {
					queues[type].push({ id });
				}
			});

			queues[type].drain(done);
		}),
		() => {
			Utils.info("Scrape completed".green);
			Utils.error(`Failed list:`, notFoundIDs.join());
		}
	);
};
