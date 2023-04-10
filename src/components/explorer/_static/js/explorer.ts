import { ToramItem } from "../../../../modules/types/ToramItem.js";
import { ToramMap } from "../../../../modules/types/ToramMap.js";
import { ToramMonster } from "../../../../modules/types/ToramMonster.js";

{
	const explorerData: {
		explorer: HTMLDivElement;
		search: HTMLInputElement;
		toggle: HTMLLinkElement;
		panel: HTMLDivElement;
		searchTypeFilter: string[];
		searchQuery: string;
		searchTimeout: NodeJS.Timeout | undefined;
	} = {
		explorer: document.getElementById("explorer") as HTMLDivElement,
		search: document.getElementById("search") as HTMLInputElement,
		panel: document.getElementById("explorer-option-panel") as HTMLDivElement,
		toggle: document.getElementById("explorer-option-toggle") as HTMLLinkElement,
		searchTypeFilter: [],
		searchQuery: "*",
		searchTimeout: undefined,
	};

	const explorerLoadMore = async () => {
		const page = parseInt(explorerData.explorer.getAttribute("page") || "1");
		const data = await fetch(
			[
				`/api/search/${encodeURIComponent(explorerData.searchQuery)}`,
				explorerData.searchTypeFilter.length > 0 ? `-t "${explorerData.searchTypeFilter.join(";")}"` : "",
				`--page ${page + 1}`,
			].join(" ")
		);
		const json = await data.json();

		explorerData.explorer.setAttribute("page", `${page + 1}`);

		explorerInsertData(json.list);
	};

	const explorerSendSearchRequest = async () => {
		explorerData.searchQuery = explorerData.search.value;

		if (explorerData.searchQuery.trim().length === 0) explorerData.searchQuery = "*";
		const data = await fetch(
			[
				`/api/search/${encodeURIComponent(explorerData.searchQuery)}`,
				explorerData.searchTypeFilter.length > 0 ? `-t "${explorerData.searchTypeFilter.join(";")}"` : "",
				"--page 1",
			].join(" ")
		);
		const json = await data.json();

		explorerData.explorer.innerHTML = "";
		explorerData.explorer.setAttribute("page", "1");

		explorerInsertData(json.list);
	};

	const explorerInsertData = (array: (ToramItem | ToramMap | ToramMonster)[]) => {
		if (explorerData.explorer.innerHTML.includes("Nothing was found")) return;

		if (array.length === 0) {
			explorerData.explorer.innerHTML += [
				'<div class="col s12">',
				'<div class="animate card hoverable">',
				'<div class="card-content">',
				"<b>Nothing was found or your query was incorrect.</b>",
				"</div>",
				"</div>",
				"</div>",
			].join("");

			return;
		}

		for (const item of array) {
			const baseStat = (item as ToramItem).stats?.find((i) => i.name.startsWith("Base"));
			const element = document.createElement("div");
			element.id = item.id;
			element.style.cursor = "pointer";
			element.classList.add("col", "animate");
			element.innerHTML += [
				`<div class="card hoverable" onclick="(()=>{window.location.href='/details/${item.id}'})()">`,
				'<div class="card-content">',
				`<p><b>${item.name}</b></p>`,
				"<p>",
				// @ts-ignore
				`${getItemTypeIcon(item.type)}<span>${item.type}</span>`,
				baseStat && ` <b>${baseStat.val}</b>`,
				"</p>",
				"</div>",
				"</div>",
			].join("");

			explorerData.explorer.innerHTML += element.outerHTML;
		}
	};

	for (const input of explorerData.panel.getElementsByTagName("input")) {
		input.onchange = () => {
			if (input.checked) {
				explorerData.searchTypeFilter.push(input.value);
			} else {
				const index = explorerData.searchTypeFilter.findIndex((e) => e === input.value);
				explorerData.searchTypeFilter.splice(index, 1);
			}

			explorerSendSearchRequest();
		};
	}

	explorerData.explorer.onscroll = () => {
		if (
			Math.abs(
				explorerData.explorer.scrollHeight -
					explorerData.explorer.scrollTop -
					explorerData.explorer.clientHeight
			) < 10
		) {
			explorerLoadMore();
		}
	};

	explorerData.search.onkeyup = () => {
		clearTimeout(explorerData.searchTimeout);
		explorerData.searchTimeout = setTimeout(() => {
			if (explorerData.search.value.length === 0) {
				explorerData.searchQuery = "*";
			}
			explorerSendSearchRequest();
		}, 500);
	};

	explorerData.panel.classList.toggle("active");
	explorerData.panel.style.display = "inline-block";
	explorerData.toggle.onclick = () => {
		explorerData.toggle.classList.toggle("active");
		explorerData.panel.classList.toggle("active");
	};

	explorerSendSearchRequest();
}
