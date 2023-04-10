import { GuideResultSuccess } from "../../../../modules/leveling/types/index.js";

const levelGuideDisplayLimit = 10;

{
	const elems = {
		levelStart: document.getElementById("level_start") as HTMLInputElement,
		levelEnd: document.getElementById("level_end") as HTMLInputElement,
		levelExpBonus: document.getElementById("level_exp_bonus") as HTMLInputElement,
		levelFilter: document.getElementById("level_filter") as HTMLSelectElement,
		levelPreserve: document.getElementById("level_preserve") as HTMLSelectElement,
		levelEvent: document.getElementById("level_include_events") as HTMLSelectElement,
		levelBtn: document.getElementById("levelBtn") as HTMLDivElement,
		base: (document.getElementById("levelGuide") as HTMLDivElement).innerHTML,
		scroll: document.getElementById("scrollHidden") as HTMLDivElement,
		progress: document.getElementsByClassName("progress").item(0) as HTMLDivElement,
		levelGuide: document.getElementById("levelGuide") as HTMLDivElement,
	};

	elems.levelBtn.classList.remove("disabled");
	elems.levelBtn.addEventListener("click", (_) => {
		const values = {
			start: elems.levelStart.value || 1,
			end: elems.levelEnd.value || Number(elems.levelStart.value) + Number(1),
			expBonus: elems.levelExpBonus.value || undefined,
			includeEvents: elems.levelEvent.value,
			filter: elems.levelFilter.value,
			preserve: elems.levelPreserve.value,
		};

		elems.levelBtn.classList.add("disabled");
		elems.progress.style.height = "4px";
		elems.progress.style.margin = "2rem 0";
		elems.scroll.style.height = `${elems.levelGuide.clientHeight}px`;
		setTimeout(() => {
			elems.scroll.style.height = "0px";
			elems.scroll.style.overflow = "hidden";
		}, 50);

		fetch(
			[
				`/api/level/${values.start}`,
				values.end,
				values.filter,
				values.preserve,
				values.includeEvents,
				values.expBonus ? `-e ${values.expBonus}` : "",
				"?raw",
			].join(" ")
		)
			.then((res) => res.json())
			.then(async (guide: GuideResultSuccess) => {
				setTimeout(() => {
					elems.progress.style.height = "0";
					elems.progress.style.margin = "0";
					elems.levelGuide.innerHTML = elems.base;

					guide.list.forEach((range) => {
						const base = (
							(document.getElementById("levelGuide") as HTMLDivElement)
								.getElementsByTagName("li")
								.item(0) as HTMLLIElement
						).cloneNode(true) as HTMLElement;
						base.classList.remove("hidden");

						base.querySelectorAll(".p_level_header").forEach((header) => {
							header.innerHTML =
								range.startLevel === range.endLevel
									? header.innerHTML
											.replace(/\%1/gi, range.startLevel.toString())
											.replace(/\- \%2/gi, "")
											.replace(/\%3/gi, range.bonusExp.toString())
									: header.innerHTML
											.replace(/\%1/gi, range.startLevel.toString())
											.replace(/\%2/gi, range.endLevel.toString())
											.replace(/\%3/gi, range.bonusExp.toString());
						});

						const listBoss = range.boss?.slice(0, levelGuideDisplayLimit);
						if (listBoss.length > 0) {
							const preservedEntry = listBoss.find((entry) => entry.preserve);
							if (guide.pr && preservedEntry) {
								listBoss[listBoss.indexOf(preservedEntry)] = undefined;
								listBoss.unshift(preservedEntry);
							}
							listBoss.forEach((e_boss) => {
								if (!e_boss) return;
								base.getElementsByClassName("p_level_boss").item(0).innerHTML += [
									"<tr>",
									`<td><a href="/details/${e_boss.id}">${e_boss.name}</a>${
										e_boss.preserve ? " <b>(*)</b>" : ""
									}</td>`,
									`<td>${e_boss.type}</td>`,
									`<td>${e_boss.level}</td>`,
									`<td>${e_boss.count}~${e_boss.countWithoutBonus}</td>`,
									"</tr>",
								].join("");
							});
						} else {
							base.getElementsByClassName("p_level_boss_wrap").item(0).innerHTML = "";
						}

						const listMini = range.mini?.slice(0, levelGuideDisplayLimit);
						if (listMini.length > 0) {
							const preservedEntry = listMini.find((entry) => entry.preserve);
							if (guide.pr && preservedEntry) {
								// @ts-ignore
								listMini[listMini.indexOf(preservedEntry)] = undefined;
								listMini.unshift(preservedEntry);
							}
							listMini.forEach((e_mini) => {
								if (!e_mini) return;
								base.getElementsByClassName("p_level_mini").item(0).innerHTML += [
									"<tr>",
									`<td><a href="/details/${e_mini.id}">${e_mini.name}</a>${
										e_mini.preserve ? " <b>(*)</b>" : ""
									}</td>`,
									`<td>${e_mini.type}</td>`,
									`<td>${e_mini.level}</td>`,
									`<td>${e_mini.count}~${e_mini.countWithoutBonus}</td>`,
									"</tr>",
								].join("");
							});
						} else {
							base.getElementsByClassName("p_level_mini_wrap").item(0).innerHTML = "";
						}

						const listNorm = range.mons?.slice(0, levelGuideDisplayLimit);
						if (listNorm.length > 0) {
							const preservedEntry = listNorm.find((entry) => entry.preserve);
							if (guide.pr && preservedEntry) {
								// @ts-ignore
								listNorm[listNorm.indexOf(preservedEntry)] = undefined;
								listNorm.unshift(preservedEntry);
							}
							listNorm.forEach((e_norm) => {
								if (!e_norm) return;
								// @ts-ignore
								base.getElementsByClassName("p_level_norm").item(0).innerHTML += [
									"<tr>",
									`<td><a href="/details/${e_norm.id}">${e_norm.name}</a>${
										e_norm.preserve ? " <b>(*)</b>" : ""
									}</td>`,
									`<td>${e_norm.type}</td>`,
									`<td>${e_norm.level}</td>`,
									`<td>${e_norm.count}~${e_norm.countWithoutBonus}</td>`,
									"</tr>",
								].join("");
							});
						} else {
							base.getElementsByClassName("p_level_norm_wrap").item(0).innerHTML = "";
						}

						if (listBoss.length > 0 || listMini.length > 0 || listNorm.length > 0) {
							elems.levelGuide.getElementsByTagName("ul").item(0).appendChild(base);

							// @ts-ignore
							M.AutoInit();
						}
					});

					elems.scroll.style.height = `${elems.levelGuide.clientHeight}px`;
					setTimeout((_) => {
						elems.scroll.style.all = null;
						elems.levelBtn.classList.remove("disabled");
					}, 300);
				}, 350);
			});
	});
}
