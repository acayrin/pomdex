import { search } from "../../modules/search/query.js";
import { ToramMap } from "../../modules/_types/map.js";

export const MapDetails = async (props: { item: ToramMap }) => (
	<>
		<p>
			<b>Type:</b> {props.item.type}
		</p>
		<p>
			<b>Monsters:</b>
		</p>
		<table class="striped no-padding">
			<tbody>
				{await Promise.all(
					props.item.monsters?.map(async (monster) => {
						const monsterItem = (await search(monster, true)).list.pop();

						return (
							<tr>
								<td>
									<a href={monsterItem ? `/details/${monster}` : "#"}>
										{monsterItem?.name || monster}
									</a>
								</td>
								<td>{monsterItem?.type || "Unknown"}</td>
							</tr>
						);
					})
				)}
			</tbody>
		</table>
	</>
);
