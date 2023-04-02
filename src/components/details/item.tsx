import { bestColor, Color, invertHex } from "../../modules/color/index.js";
import { search } from "../../modules/search/query.js";
import Utils from "../../modules/utils/index.js";
import { ToramItem } from "../../modules/_types/item.js";

export const ItemDetails = async (props: { item: ToramItem }) => {
	const { item } = props;

	const crystaUpgradeTo: ToramItem[] = [];
	for (const usage of item.uses) {
		const possibleItem = (await search(`${usage.for} -t crysta`)).list.at(0);

		if (possibleItem) {
			item.uses = Utils.filter(item.uses, (u) => u.for !== usage.for);
			crystaUpgradeTo.push(possibleItem as ToramItem);
		}
	}

	const crystaUpgradeFor: ToramItem[] = [];
	for (const stat of item.stats) {
		if (!stat.name.startsWith("Upgrade for")) continue;

		const possibleItem = (await search(`${stat.val} -t crysta`)).list.at(0);

		if (possibleItem) {
			item.stats = Utils.filter(item.stats, (s) => s.name !== stat.name);
			crystaUpgradeFor.push(possibleItem as ToramItem);
		}
	}

	return (
		<div class="row">
			<div class="col s6">
				<p>
					<b>Type:</b> {item.type}
				</p>
				<p>
					<b>Sell:</b> {item.sell} Spina
				</p>
				<p>
					<b>Proc:</b>{" "}
					{(item.proc && (
						<>
							{item.proc.type} x<b>{item.proc.amount}</b>
						</>
					)) ||
						"N/A"}
				</p>
				{item.stats?.length > 0 && (
					<>
						<p>
							<b>Stats:</b>
						</p>
						{item.stats?.map((stat) => (
							<p>
								- {stat.name} <b>{stat.val}</b>
							</p>
						))}
					</>
				)}
			</div>
			<div class="col s6 right-align">
				{(item as ToramItem).thumb ? (
					<img
						src={item.thumb}
						alt={item.name}
					/>
				) : (
					{}
				)}
			</div>
			<div class="col s12">
				{crystaUpgradeFor.map((crysta) => (
					<>
						<p>
							<b>Upgrade for:</b>
						</p>
						<p>
							<a href={`/details/${crysta.id}`}>{crysta.name}</a>
						</p>
					</>
				))}
				{crystaUpgradeTo.map((crysta) => (
					<>
						<p>
							<b>Upgrade to:</b>
						</p>
						<p>
							<a href={`/details/${crysta.id}`}>{crysta.name}</a>
						</p>
					</>
				))}
				{item.drops?.length > 0 && (
					<>
						<p>
							<b>Obtainable from:</b>
						</p>
						<table class="striped no-padding">
							<tbody>
								{await Promise.all(
									item.drops?.map(async (drop) => {
										const monsterItem = (await search(drop.from, true)).list.pop();

										return (
											<tr>
												<td>
													<a href={monsterItem ? `/details/${drop.from}` : "#"}>
														{monsterItem?.name || drop.from}
													</a>
												</td>
												<td>{monsterItem?.type || "Unknown"}</td>
												<td>
													{drop.dyes?.map((dye) => (
														<span
															class="color-block"
															style={[
																`background: #${Color.get(Number(dye))}`,
																`color: #${invertHex(Color.get(Number(dye)))}`,
															].join(";")}>
															<b>{dye}</b>
														</span>
													))}
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</>
				)}
				{item.uses?.length > 0 && (
					<>
						<p>
							<b>Used for:</b>
						</p>
						<table class="striped no-padding">
							<tbody>
								{await Promise.all(
									item.uses?.map(async (use) => {
										const useItem = (await search(use.for, true)).list.pop();

										return (
											<tr>
												<td>
													<a href={useItem ? `/details/${use.for}` : "#"}>
														{useItem?.name || use.for}
													</a>
												</td>
												<td>{useItem?.type || "Unknown"}</td>
												<td>
													x<b>{use.amount}</b>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</>
				)}
				{item.recipe.materials?.length > 0 && (
					<>
						<p>
							<b>Crafting recipe:</b>
						</p>
						<p>
							<b>Level: </b> {item.recipe.level}
						</p>
						<p>
							<b>Difficulty: </b> {item.recipe.difficulty}
						</p>
						<p>
							<b>Fee: </b> {item.recipe.fee}
						</p>
						<p>
							<b>Set: </b> {item.recipe.set}
						</p>
						<p>
							<b>Materials: </b>
						</p>
						<table class="striped no-padding">
							<tbody>
								{await Promise.all(
									item.recipe.materials?.map(async (material) => {
										const materialItem = (await search(material.item, true)).list.pop();

										return (
											<tr>
												<td>
													<a href={materialItem ? `/details/${material.item}` : "#"}>
														{materialItem?.name || material.item}
													</a>
												</td>
												<td>{materialItem?.type || "Unknown"}</td>
												<td>
													x<b>{material.amount}</b>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</>
				)}
			</div>
		</div>
	);
};
