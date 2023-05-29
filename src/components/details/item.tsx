import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ColorMapping, getInvertedColor } from "../../modules/color/index.js";
import { getElementColor } from "../../modules/element_funcs/getElementColor.js";
import { getItemTypeIcon } from "../../modules/element_funcs/getItemTypeIcon.js";
import { Helmet } from "../../modules/helmet/helmet.js";
import { Precompile } from "../../modules/precompile/index.js";
import Search from "../../modules/search/query.js";
import { ToramItem } from "../../modules/types/ToramItem.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

const extractItemBaseStat = (
	item: ToramItem
): {
	atk?: number;
	def?: number;
	sta?: number;
	ele?: string;
} => {
	const itemBaseStat = {
		atk: undefined,
		def: undefined,
		sta: undefined,
		ele: undefined,
	};

	for (const stat of item.stats) {
		if (stat.name.includes("Base ATK")) {
			itemBaseStat.atk = Number(stat.val);
			item.stats = item.stats.filter((s) => s.name !== stat.name);
		}
		if (stat.name.includes("Base Stability")) {
			itemBaseStat.sta = Number(stat.val);
			item.stats = item.stats.filter((s) => s.name !== stat.name);
		}
		if (stat.name.includes("Base DEF")) {
			itemBaseStat.def = Number(stat.val);
			item.stats = item.stats.filter((s) => s.name !== stat.name);
		}
		if (stat.name.includes("Element")) {
			itemBaseStat.ele = stat.name;
			item.stats = item.stats.filter((s) => s.name !== stat.name);
		}
	}

	return itemBaseStat;
};

const renderItemBaseStat = (itemBaseStat: { atk?: number; def?: number; sta?: number; ele?: string }) =>
	itemBaseStat.atk ? (
		<>
			{" "}
			@ <b>ATK {itemBaseStat.atk}</b> ({itemBaseStat.sta}%)
		</>
	) : (
		itemBaseStat.def && (
			<>
				{" "}
				@ <b>DEF {itemBaseStat.def}</b>
			</>
		)
	);

const renderMaterialItem = async (material: { amount: number; item: string }) => {
	const materialItem = (await Search.query(material.item, true)).list.pop();

	return (
		<div
			key={material.item}
			class="col s12">
			<div class="col s6">
				{getItemTypeIcon(materialItem?.type)}
				<a href={materialItem ? `/details/${material.item}` : "#"}>{materialItem?.name || material.item}</a>
			</div>
			<div class="col s3">{materialItem?.type || "Unknown"}</div>
			<div class="col s3">
				x<b>{material.amount}</b>
			</div>
		</div>
	);
};

const renderItemUsage = async (use: { for: string; amount: number }) => {
	const useItem = (await Search.query(use.for, true)).list.pop();

	return (
		<div
			key={useItem.id}
			class="col s12">
			<div class="col s6">
				{getItemTypeIcon(useItem?.type)}
				<a href={useItem ? `/details/${use.for}` : "#"}>{useItem?.name || use.for}</a>{" "}
			</div>
			<div class="col s3">{useItem?.type || "Unknown"}</div>
			<div class="col s3">
				x<b>{use.amount}</b>
			</div>
		</div>
	);
};

const renderDropItem = async (drop: { from: string; dyes: string[] }) => {
	const monsterItem = (await Search.query(drop.from, true)).list.pop();

	return (
		<div
			key={drop.from}
			class="col s12">
			<div class="col s6">
				{getItemTypeIcon(monsterItem?.type || drop.from)}
				<a href={monsterItem ? `/details/${drop.from}` : "#"}>{monsterItem?.name || drop.from}</a>
			</div>
			<div class="col s3">
				{monsterItem?.type || new RegExp(/skill/gi).test(drop.from) ? "Player Skill" : "NPC"}
			</div>
			<div class="col s3">
				{drop.dyes?.map((dye) => (
					<span
						key={dye}
						class="color-block"
						style={[
							`background: #${ColorMapping.get(Number(dye))}`,
							`color: #${getInvertedColor(ColorMapping.get(Number(dye)))}`,
						].join(";")}>
						<b>{dye}</b>
					</span>
				))}
			</div>
		</div>
	);
};

export const ItemDetails = async (props: { item: ToramItem }) => {
	const { item } = props;
	const itemBaseStat = extractItemBaseStat(item);

	const crystaUpgradeTo: ToramItem[] = [];
	for (const usage of item.uses) {
		const possibleItem = (await Search.query(usage.for)).list.find((entry) => entry.id !== item.id);

		if (new RegExp(/crysta/i).test(possibleItem?.type)) {
			item.uses = item.uses.filter((u) => u.for !== usage.for);
			crystaUpgradeTo.push(possibleItem as ToramItem);
		}
	}

	const crystaUpgradeFor: ToramItem[] = [];
	for (const stat of item.stats) {
		if (!stat.name.startsWith("Upgrade for")) continue;

		const possibleItem = (await Search.query(`${stat.val} -t crysta`)).list.find((entry) => entry.id !== item.id);

		if (possibleItem) {
			item.stats = item.stats.filter((s) => s.name !== stat.name);
			crystaUpgradeFor.push(possibleItem as ToramItem);
		}
	}

	return (
		<div class="row">
			{item.thumb && (
				<div class="col s6">
					<img
						src={item.thumb}
						alt={item.name}
					/>
				</div>
			)}

			<div class="item-stat col s6">
				<b>Type:</b>
				<div>
					{getItemTypeIcon(item.type)}
					{item.type}
					{renderItemBaseStat(itemBaseStat)}
				</div>
			</div>

			{itemBaseStat.ele && (
				<div class="item-stat col s6">
					<b>Base element:</b>
					<div style={`color:${getElementColor(itemBaseStat.ele)}`}>
						{getItemTypeIcon("element")}
						{itemBaseStat.ele}
					</div>
				</div>
			)}

			<div class="item-stat col s6">
				<b>Sell value:</b>
				<div>
					{getItemTypeIcon("coin")}
					{(item.sell && (
						<>
							<b>{item.sell}</b> Spina
						</>
					)) ||
						"Unknown"}
				</div>
			</div>

			<div class="item-stat col s6">
				<b>Process value:</b>
				<div>
					{getItemTypeIcon(null)}
					{(item.proc.amount !== -1 && (
						<>
							{item.proc.type} x<b>{item.proc.amount}</b>
						</>
					)) ||
						"Unknown"}
				</div>
			</div>

			{crystaUpgradeFor.length > 0 && (
				<div class="item-stat col s6">
					<b>Crysta Upgrade for:</b>
					{crystaUpgradeFor.map((crysta) => (
						<div key={crysta.id}>
							{getItemTypeIcon("crysta")}
							<a href={`/details/${crysta.id}`}>{crysta.name}</a>
						</div>
					))}
				</div>
			)}

			{crystaUpgradeTo.length > 0 && (
				<div class="item-stat col s6">
					<b>Crysta Upgrade to:</b>
					{crystaUpgradeTo.map((crysta) => (
						<div key={crysta.id}>
							{getItemTypeIcon("crysta")}
							<a href={`/details/${crysta.id}`}>{crysta.name}</a>
						</div>
					))}
				</div>
			)}

			<div class="col s12" />

			{item.stats?.length > 0 && (
				<div class="item-stat col s6">
					<b>Item stats:</b>
					{item.stats?.map((stat) => (
						<div key={stat.name}>
							{stat.name} <b>{stat.val}</b>
						</div>
					))}
				</div>
			)}

			{item.recipe.materials?.length > 0 && (
				<div class="item-stat col s6">
					<b>Crafting recipe:</b>
					<div>
						<b>Level: </b> {item.recipe.level}
					</div>
					<div>
						<b>Difficulty: </b> {item.recipe.difficulty}
					</div>
					<div>
						<b>Fee: </b> {item.recipe.fee.toLocaleString()}
					</div>
					<div>
						<b>Set: </b> {item.recipe.set}
					</div>
					<div>
						<b>Materials: </b>
					</div>
					<div class="item-stat">
						{await Promise.all(item.recipe.materials?.map((material) => renderMaterialItem(material)))}
					</div>
				</div>
			)}

			{item.uses?.length > 0 && (
				<div class="item-stat col s6">
					<b>Item usages:</b>
					{await Promise.all(item.uses?.map((use) => renderItemUsage(use)))}
				</div>
			)}

			{item.drops?.length > 0 && (
				<div class={`item-stat col ${item.drops?.length > 8 ? "s12" : "s6"}`}>
					<b>Obtainable from:</b>
					{await Promise.all(item.drops?.map((drop) => renderDropItem(drop)))}
				</div>
			)}

			<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}</Helmet.styles.Push>
		</div>
	);
};
