import ky from "ky";
import { load } from "cheerio";
import { ToramMap } from "../types/ToramMap.js";

export const scrapeMap = (id = 1): Promise<ToramMap> =>
	new Promise((resolve, reject) => {
		// preload
		ky(`https://coryn.club/map.php?id=${id}`, {
			retry: {
				limit: 1e9,
			},
			timeout: 60e3,
		})
			.text()
			.then((html) => {
				if (html.toLowerCase().includes("no result found")) {
					return reject(undefined);
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
				return resolve({
					id: `M${id}`,
					name: mapName,
					type: "Map",
					monsters: monsterList,
				} as ToramMap);
			})
			.catch(reject);
	});
