import { ColorMapping, getInvertedColor } from "../../modules/color/index.js";
import { PomdexMonthlyDye } from "../../modules/database/index.js";
import Search from "../../modules/search/query.js";
import { ToramMonster } from "../../modules/types/ToramMonster.js";
import { getElementColor } from "../../modules/element_funcs/getElementColor.js";
import { getItemTypeIcon } from "../../modules/element_funcs/getItemTypeIcon.js";

export const MonsterDetails = async (props: { item: ToramMonster }) => {
	const { item } = props;
	const monthlyDyeEntry = (
		await PomdexMonthlyDye.findOne({
			$and: [
				{
					list: {
						$elemMatch: {
							name: {
								$regex: new RegExp(item.name, "gi"),
							},
						},
					},
				},
				{
					month: new Date().getMonth(),
				},
			],
		})
	)?.list.find((entry) => new RegExp(item.name, "gi").test(entry.name));

	return (
		<div class="row">
			<div class="item-stat col s6">
				<b>Type:</b>
				<div>
					{getItemTypeIcon(item.type)}
					{item.type}
				</div>
			</div>

			<div class="item-stat col s6">
				<b>Spawn location:</b>
				<div>
					{getItemTypeIcon("Map")}
					<a href={item.map === "Event" ? "#" : `/details/${item.map}`}>
						{(await Search.query(item.map, true)).list.at(0)?.name || item.map}
					</a>
				</div>
			</div>

			<div class="item-stat col s6">
				<b>Level:</b>
				<div>{item.level || "Unknown"}</div>
			</div>

			<div class="item-stat col s6">
				<b>Hitpoints:</b>
				<div>{item.hp ? item.hp.toLocaleString() : "Unknown"}</div>
			</div>

			<div class="item-stat col s6">
				<b>Element:</b>
				<div style={`color:${getElementColor(item.ele)}`}>
					{getItemTypeIcon("element")}
					{item.ele || "Unknown"}
				</div>
			</div>

			<div class="item-stat col s6">
				<b>Base EXP drop:</b>
				<div>{item.exp ? item.exp.toLocaleString() : "Unknown"}</div>
			</div>

			<div class="item-stat col s6">
				<b>Is tamable:</b>
				<div>{item.tamable || "Unknown"}</div>
			</div>

			{monthlyDyeEntry && (
				<div class="item-stat col s6">
					<b>Monthly dye drop:</b>
					<div>
						{["A", "B", "C"].map((slot, index) => {
							let code: "A" | "B" | "C" | number =
								monthlyDyeEntry.slot === slot ? monthlyDyeEntry.code : "C";
							if (index === 0) code = "A";
							else if (index === 1) code = "B";

							return (
								<span
									key={code}
									class="color-block"
									style={[
										`background: #${ColorMapping.get(code as number)}`,
										`color: #${getInvertedColor(ColorMapping.get(code as number))}`,
									].join(";")}>
									<b>{code}</b>
								</span>
							);
						})}
					</div>
				</div>
			)}

			{item.drops?.length > 0 && (
				<div class="item-stat col s12">
					<b>Obtainable items:</b>
					{await Promise.all(
						item.drops?.map(async (drop) => {
							const dropItem = (await Search.query(drop.id, true)).list.pop();

							return (
								<div
									class="col s12"
									key={drop.id}>
									<div class="col s6">
										{getItemTypeIcon(dropItem.type)}
										<a href={dropItem ? `/details/${drop.id}` : "#"}>{dropItem?.name || drop.id}</a>
									</div>
									<div class="col s3">{dropItem?.type || "Unknown"}</div>
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
						})
					)}
				</div>
			)}
		</div>
	);
};
