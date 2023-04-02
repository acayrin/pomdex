import { PomdexCollection } from "../database/init.js";
import { ToramItem } from "../_types/item.js";
import { uploadFile } from "./upload.js";

export const scrapeItem = async (id: number) => {
	const ky = (await import("ky")).default;
	const { load } = await import("cheerio");
	const ID = id || 1;

	// preload
	const html = await (
		await ky(`https://coryn.club/item.php?id=${ID}`, {
			retry: {
				limit: 1e9,
			},
			timeout: 60e3,
		})
	).text();
	if (html.toLowerCase().includes("no result found")) {
		return undefined;
	}

	const $ = load(html);
	const entryName = $(".card-title").first().text().trim();
	const entryType = entryName.match(/\[.+?\]/g)?.pop() || "Unknown";

	// The json
	const entryObject: ToramItem = {
		id: `T${ID}`, // item id
		name: entryName.replace(entryType, "").trim(), // item name
		type: entryType.replace(/[^\w\s]/gi, ""), // item type
		sell: undefined, // item sell
		proc: undefined, // item process
		thumb: undefined, // item thumbnail
		stats: [], // item stats
		drops: [], // item drops
		uses: [], // item used for
		recipe: {
			// item recipe
			fee: 0, // recipe fee
			set: 0, // recipe set
			level: 0, // recipe level
			difficulty: 0, // recipe difficulty
			materials: [], // recipe materials
		},
	};

	// Item stats
	$(".item-basestat > div")
		.slice(1)
		.each((_, elem) => {
			const e = {
				name: $($(elem).children("div")[0]).text().replaceAll(/ {2,}/gi, "").replaceAll(/\n|\t/gi, ""),
				val: $($(elem).children("div")[1]).text().replaceAll(/ {2,}/gi, "").replaceAll(/\n|\t/gi, ""),
			};
			entryObject.stats.push({
				name: e.name,
				val: Number(e.val) || e.val,
			});
		});

	// Item obtain from
	$(".pagination-js-item").each((_, elem) => {
		const dyes: string[] = [];
		$(elem)
			.find("div")
			.each((_, elem) => {
				$(elem)
					.find(".dye-group")
					.first()
					.find("div")
					.each((_, elem) => {
						if (new RegExp(/\d+/gi).test($(elem).text())) {
							dyes.push($(elem).text());
						} else {
							dyes.push("0");
						}
					});
			});

		const dropsDiv = $(elem).find("div").first();
		let dropMonster = dropsDiv.find("a").first().attr("href");
		dropMonster = dropMonster?.includes("monster.php")
			? `E${dropMonster.match(/\d+/g)[0]}`
			: dropsDiv
					.text()
					.replace(/\t/g, "")
					.trim()
					.replace(/\[(.*)\]/i, "");
		entryObject.drops.push({
			from: dropMonster,
			dyes: dyes.length > 0 ? dyes : [],
		});
	});

	// Item used for
	$("html")
		.find("ul .styled-list")
		.each((_, elem) => {
			const li = $(elem).children("li").first();
			const a = li.find("a").first();
			const link = a.attr("href");
			const amount = li.text().replace(a.text(), "").replace(/\n/g, "").trim().match(/\d+/g);
			if (link.includes("item.php")) {
				entryObject.uses.push({
					for: `T${link.match(/\d+/g)[0]}`,
					amount: amount ? Number(amount.pop()) : 1,
				});
			}
		});

	// item proc/sell
	$(".item-prop.mini").each((_, elem) => {
		if ($(elem).html().includes("Sell") && $(elem).html().includes("Process")) {
			$(elem)
				.children("div")
				.each((_, elem) => {
					if ($(elem).text().includes("Sell")) {
						entryObject.sell = Number($(elem).text().match(/\d+/g)?.shift() || 0);
					}
					if ($(elem).text().includes("Process")) {
						entryObject.proc = {
							type: $(elem).text().replace("Process", "").replace(new RegExp(/\d+/gi), "").trim(),
							amount: Number($(elem).text().match(/\d+/gi)?.shift() || -1),
						};
					}
				});
		}
	});

	if ($("html").html().includes("Recipe")) {
		// Item recipe
		$(".item-prop.mini")
			.last()
			.children("div")
			.each((_, elem) => {
				const key = $(elem).text().replace(/\s\s+/g, " ");

				if (key.includes("Materials")) {
					$(elem)
						.find("li")
						.each((_, elem) => {
							const a = $(elem).find("a").first();
							const item = a.attr("href")
								? `T${a.attr("href").match(/\d+/g).shift()}`
								: $(elem).text().replace(/\-/g, "").replace(/\d+x/g, "").trim();

							const out = {
								item,
								amount: Number($(elem).text().match(/\d+/g).shift()),
							};

							entryObject.recipe.materials.push(out);
						});
				}

				if (key.includes("Fee")) {
					entryObject.recipe.fee = key.match(/\d+/g) ? Number(key.match(/\d+/g).shift()) : 0;
				}
				if (key.includes("Set")) {
					entryObject.recipe.set = key.match(/\d+/g) ? Number(key.match(/\d+/g).shift()) : 0;
				}
				if (key.includes("Level")) {
					entryObject.recipe.level = key.match(/\d+/g) ? Number(key.match(/\d+/g).shift()) : 0;
				}
				if (key.includes("Difficulty")) {
					entryObject.recipe.difficulty = key.match(/\d+/g) ? Number(key.match(/\d+/g).shift()) : 0;
				}
			});
	}

	// item thumbnail, if any
	const thumbUrl = $("div.card-container div.app-div").find("td").first().attr("background");
	if (thumbUrl) {
		const existingEntry = (await PomdexCollection.findOne({
			id: entryObject.id,
		})) as ToramItem;

		if (existingEntry?.thumb) {
			entryObject.thumb = existingEntry.thumb;
		} else {
			const buffer = Buffer.from(
				await (
					await ky(`https://coryn.club/${thumbUrl}`, {
						retry: {
							limit: 1e9,
						},
						timeout: 60e3,
					})
				).arrayBuffer()
			);

			entryObject.thumb = await uploadFile(buffer, `${entryObject.id}.jpg`);
		}
	}

	// postload
	return entryObject;
};
