import { load } from "cheerio";
import { App } from "../app.js";
import ky from "ky";
import { PomdexMonthlyDye } from "../database/index.js";
import { MonthlyDyeListEntry } from "../types/index.js";

const intentionalTypoList = [
	["selle", "Seele"],
	["frame", "flame"],
	["inzanio of", "inzanio the"],
	["beaat", "beast"],
	["jade bird", "jade raptor"],
	["gg", "g"],
	["b.b.g", "B.B g"],
	["glass", "grass"],
	["memecoleolus", "memecoleous"],
	["prot leon", "proto leon"],
	["barning", "burning"],
	["super dark mushroom", "super night mushroom"],
];

const scrapeColors = async () => {
	const date = new Date();
	const month = date.getMonth() + 2 > 12 ? 1 : date.getMonth() + 2;

	const res = await PomdexMonthlyDye.findOne({
		month,
	});

	if (res && date.getFullYear() - new Date(res._lastUpdated).getFullYear() === 0) {
		App.info("DYE-TABLE".yellow, `List for #${res.month} doesn't need update yet.`);
		return;
	}

	const monthlyDyeList: MonthlyDyeListEntry[] = [];
	const $ = load(await ky("https://tanaka0.work/AIO/en/DyePredictor/ColorWeapon").text());

	$("table.table")
		.find("tr")
		.each((_, tr) => {
			const temp = {
				name: $(tr)
					.children("td")
					.first()
					.text()
					.replace(new RegExp(/\n+/gim), "")
					.replace(new RegExp(/\(.*\)/gi), "")
					.replace(new RegExp(/ {2,}/g), " ")
					.trim(),
				slot: RegExp(new RegExp(/[ABC]/)).exec($(tr).children("td").last().text())?.at(0) || null,
				code: Number(RegExp(new RegExp(/\d+/)).exec($(tr).children("td").last().text())?.at(0) || 0),
			};

			if (temp.name.length === 0) return;

			// fix typos
			for (const pair of intentionalTypoList) {
				temp.name = temp.name.replace(new RegExp(pair[0], "gi"), pair[1]);
			}

			const entry: {
				name: string;
				slot: "A" | "B" | "C";
				code: number;
			} = {
				name: temp.name,
				slot: "C",
				code: temp.code,
			};
			if (temp.slot === "A") entry.slot = "A";
			if (temp.slot === "B") entry.slot = "B";

			monthlyDyeList.push(entry);
		});

	if (res) {
		await PomdexMonthlyDye.updateOne(
			{ month },
			{
				$set: {
					_lastUpdated: Date.now(),
					month,
					list: monthlyDyeList,
				},
			}
		);
		App.info("DYE-TABLE".yellow, `Updated month #${month} dye list.`.green);
	} else {
		await PomdexMonthlyDye.insertOne({
			_lastUpdated: Date.now(),
			month,
			list: monthlyDyeList,
		});
		App.info("DYE-TABLE".yellow, `Created month #${month} dye list.`.green);
	}
};

const taskDailyRefreshDyeTable = () => setInterval(() => scrapeColors, 86_400_000);

export { scrapeColors, taskDailyRefreshDyeTable };
