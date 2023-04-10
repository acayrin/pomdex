import Search from "../../modules/search/query.js";
import { ToramMap } from "../../modules/types/ToramMap.js";
import { getItemTypeIcon } from "../../modules/utils/getItemTypeIcon.js";

export const MapDetails = async (props: { item: ToramMap }) => {
	const { item } = props;
	const tables: string[] = [];
	for (let i = 0; i < item.monsters.length; i += 12) {
		tables.push(
			<div class={`col ${i + 12 >= item.monsters.length ? "s12" : "s6"}`}>
				{await Promise.all(
					item.monsters.slice(i, i + 12).map(async (monster) => {
						const monsterItem = (await Search.query(monster, true)).list.pop();

						return (
							<div key={monsterItem?.id}>
								<div class="col s8">
									{getItemTypeIcon(monsterItem?.type || "npc")}
									<a href={monsterItem ? `/details/${monster}` : "#"}>
										{monsterItem?.name || monster}
									</a>
								</div>
								<div class="col s4 right">{monsterItem?.type || "NPC"}</div>
							</div>
						);
					})
				)}
			</div>
		);
	}

	return (
		<div class="row">
			<div class="item-stat col s12">
				<b>Type:</b>
				<div>
					{getItemTypeIcon("map")}
					{item.type}
				</div>
			</div>

			<div class="item-stat col s12">
				<b>Available monsters:</b>
				<div>{tables}</div>
			</div>
		</div>
	);
};
