import "colors";
import fastq from "fastq";
import { App } from "../app.js";
import { PomdexCollection } from "../database/init.js";
import Utils from "../utils/index.js";
import { ToramItem } from "../_types/item.js";
import { ToramMap } from "../_types/map.js";
import { ToramMonster } from "../_types/monster.js";
import { scrapeItem } from "./scrapeItem.js";
import { scrapeMap } from "./scrapeMap.js";
import { scrapeMonster } from "./scrapeMonster.js";

export const scrapeAll = async () => {
	const queues = {
		map: fastq.promise(scrapeMap, 8),
		item: fastq.promise(scrapeItem, 8),
		monster: fastq.promise(scrapeMonster, 8),
	};

	const object: { [key: string]: ToramItem | ToramMap | ToramMonster } = {};
	const list = {
		map: await PomdexCollection.find({ type: "Map " }).toArray(),
		item: await PomdexCollection.find({ type: { $not: { $regex: /(boss)|(monster)|(map)/gi } } }).toArray(),
		monster: await PomdexCollection.find({ type: { $regex: /(boss)|(monster)/gi } }).toArray(),
	};
	//Utils.info(`Loaded M: ${list.map.length} - I: ${list.item.length} - E: ${list.monster.length}`);

	await Promise.all(
		["item", "monster", "map"].map(async (type) => {
			Utils.info(`Checking ${type}...`.underline);

			await Promise.all(
				Array.from(new Array(Math.round(list[type].length + 50)), (_, i) => i).map(async (i) => {
					const res = await (
						queues[type] as fastq.queueAsPromised<number, ToramItem | ToramMap | ToramMonster>
					).push(i);
					if (!res) {
						Utils.info(`Not found ${type}/${i}`.red);
						return;
					}

					try {
						await PomdexCollection.deleteMany({ id: res.id });
					} catch {}

					object[res.id] = res;
					await PomdexCollection.insertOne(res);
					Utils.info(`Added ${res.id}`.green);
				})
			);
		})
	).then(() => {
		Utils.info("Scrape completed".green);
	});
};
