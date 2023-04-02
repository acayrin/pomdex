import { ToramItem } from "../../../../modules/_types/item.js";
import { ToramMap } from "../../../../modules/_types/map.js";
import { ToramMonster } from "../../../../modules/_types/monster.js";

const scriptData: {
	explorer: HTMLDivElement;
	search: HTMLInputElement;
	searchQuery: string;
	searchTimeout: NodeJS.Timeout | undefined;
} = {
	explorer: document.getElementById("explorer") as HTMLDivElement,
	search: document.getElementById("search") as HTMLInputElement,
	searchQuery: "*",
	searchTimeout: undefined,
};

document.addEventListener("DOMContentLoaded", () => {
	init();
});

function init() {
	scriptData.explorer.onscroll = () => {
		if (
			Math.abs(
				scriptData.explorer.scrollHeight - scriptData.explorer.scrollTop - scriptData.explorer.clientHeight
			) < 1
		) {
			loadMore();
		}
	};

	scriptData.search.onkeyup = () => {
		clearTimeout(scriptData.searchTimeout);
		scriptData.searchTimeout = setTimeout(() => {
			if (scriptData.search.value.length === 0) {
				scriptData.searchQuery = "*";
			}
			searchData();
		}, 500);
	};
}

async function loadMore() {
	const page = parseInt(scriptData.explorer.getAttribute("page") || "1");
	const data = await fetch(`/api/search/${encodeURIComponent(scriptData.searchQuery)}?page=${page + 1}`);
	const json = await data.json();
	if (json.length === 0) return;

	scriptData.explorer.setAttribute("page", `${page + 1}}`);

	insertData(json);
}

async function searchData() {
	scriptData.searchQuery = scriptData.search.value;

	if (scriptData.searchQuery.trim().length === 0) scriptData.searchQuery = "*";
	const data = await fetch(`/api/search/${encodeURIComponent(scriptData.searchQuery)}?page=1`);
	const json = await data.json();
	if (json.length === 0) return;

	scriptData.explorer.innerHTML = "";
	scriptData.explorer.setAttribute("page", "1");

	insertData(json);
}

function insertData(array: (ToramItem | ToramMap | ToramMonster)[]) {
	for (const item of array) {
		const element = document.createElement("div");
		element.style.opacity = "0";
		element.id = item.id;
		element.classList.add("col", "s12", "m6", "l4", "animate");

		const lines: string[] = [];
		lines.push("<div class='card hoverable'>");
		lines.push("<div class='card-content'>");
		lines.push(`<span class='card-title'>${item.name}</span>`);
		lines.push(`<b>${item.type}</b>`);
		lines.push("</div>");
		lines.push("<div class='card-action'>");
		lines.push(`<a class='light-blue-text' href='/details/${item.id}'>View</a>`);
		lines.push(`<a class='light-blue-text' href='/manage/edit/${item.id}'>Edit</a>`);
		lines.push(`<a class='light-blue-text' href="#" onClick='confirmDeleteEntry("${item.id}")'>Delete</a>`);
		lines.push("</div>");
		lines.push("</div>");
		element.innerHTML += lines.join("");

		setTimeout(() => {
			scriptData.explorer.innerHTML += element.outerHTML;

			setTimeout(() => {
				const element = document.getElementById(item.id) as HTMLDivElement;
				element.style.opacity = "1";
			}, 500);
		}, array.indexOf(item) * 20);
	}
}

function confirmDeleteEntry(id: string) {
	if (confirm(`Confirm delete entry ${id}?`)) {
		fetch(`/api/manage/delete`, {
			method: "DELETE",
			body: JSON.stringify({
				id,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				alert(res.message);
				if (res.error) console.error(res.error);
			});
	}
}
