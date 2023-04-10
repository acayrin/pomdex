import ky from "ky";
import { load } from "cheerio";
import { getBestMatchingColor } from "../color/index.js";
import { ToramMonster } from "../types/ToramMonster.js";

export const scrapeMonster = (id = 1): Promise<ToramMonster> =>
	new Promise((resolve, reject) => {
		ky(`https://coryn.club/monster.php?id=${id}`, {
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

				// jquery
				const monsterObject: ToramMonster = {
					id: `E${id}`,
					name: undefined,
					level: undefined,
					type: undefined,
					hp: undefined,
					ele: undefined,
					exp: undefined,
					tamable: "No",
					map: undefined,
					drops: [],
				};

				// Monster name
				monsterObject.name = $(".card-title-inverse").text().replace(/\t/g, "").trim();

				// Monster stats
				$(".item-prop.col-2")
					.children("div")
					.each((_, elem) => {
						if ($(elem).text().includes("Lv")) {
							monsterObject.level = Number($(elem).children("p").last().text());
						}
						if ($(elem).text().includes("Type")) {
							monsterObject.type =
								$(elem).children("p").last().text() === "-"
									? "Monster"
									: `Boss - ${$(elem)
											.children("p")
											.last()
											.text()
											.replace(/[^a-zA-Z0-9 ]/g, "")}`;
						}
						if ($(elem).text().includes("HP")) {
							monsterObject.hp = Number.isNaN($(elem).children("p").last().text())
								? -1
								: Number($(elem).children("p").last().text());
						}
						if ($(elem).text().includes("Element")) {
							monsterObject.ele = $(elem).children("p").last().text();
						}
						if ($(elem).text().includes("Exp")) {
							monsterObject.exp = Number.isNaN($(elem).children("p").last().text())
								? -1
								: Number($(elem).children("p").last().text());
						}
						if ($(elem).text().includes("Tamable")) {
							monsterObject.tamable = $(elem).children("p").last().text();
						}
					});

				// Monster map
				$(".item-prop").each((_, elem) => {
					if ($(elem).html().includes("Spawn at")) {
						const mapEntry = $(elem).find("a").first();
						monsterObject.map =
							mapEntry && mapEntry.text() !== "Event"
								? `M${mapEntry.attr("href").match(/\d+/g).shift()}`
								: "Event";
					}
				});

				// Monster drops
				$(".monster-drop-list")
					.children(".monster-drop")
					.each((_, elem) => {
						const a = $(elem).find("a").first();
						const d = a.attr("href").match(/\d+/g).shift();
						const dyes: string[] = [];

						if ($(elem).find(".dye-group").html()) {
							$(elem)
								.find(".dye-group")
								.first()
								.find("div")
								.each((index, elem) => {
									if (new RegExp(/\d+/gi).test($(elem).text())) {
										dyes.push($(elem).text());
									} else if ($(elem).css("background-color") === "#") {
										dyes.push(index === 0 ? "A" : index === 1 ? "B" : "C");
									} else {
										dyes.push(getBestMatchingColor($(elem).css("background-color").slice(1)));
									}
								});
						}

						monsterObject.drops.push({
							id: `T${d}`,
							dyes,
						});

						if (a.text() === monsterObject.name && monsterObject.type === "Monster") {
							monsterObject.type = "Miniboss";
						}
					});

				return resolve(monsterObject);
			});
	});
