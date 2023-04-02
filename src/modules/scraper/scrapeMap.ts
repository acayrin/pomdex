import { ToramMap } from "../_types/map.js";

export const scrapeMap = async (id: number) => {
	const ky = (await import("ky")).default;
	const { load } = await import("cheerio");
	const ID = id || 1;

	// preload
	const html = await (
		await ky(`https://coryn.club/map.php?id=${ID}`, {
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

	const monsterList: string[] = [];
	$("#content .accordion.card-attach-bottom")
		.find("p")
		.each((_, elem) => {
			const monsterEntryId = $(elem).find("a").first().attr("href");
			if (monsterEntryId) {
				monsterList.push(`E${monsterEntryId.match(/\d+/g).shift()}`);
			} else {
				monsterList.push(
					$(elem)
						.text()
						.replace(/\[.+?\]/g, "")
						.trim()
				);
			}
		});

	const mapName = $("p.card-title").text();
	return {
		id: `M${ID}`,
		name: mapName,
		type: "Map",
		monsters: monsterList,
	} as ToramMap;
};
