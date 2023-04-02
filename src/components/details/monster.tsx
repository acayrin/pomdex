import { html } from "hono/html";
import { bestColor, Color, invertHex } from "../../modules/color/index.js";
import { search } from "../../modules/search/query.js";
import { ToramMonster } from "../../modules/_types/monster.js";

export const MonsterDetails = async (props: { item: ToramMonster }) => (
	<>
		<p>
			<b>Type:</b> {props.item.type}
		</p>
		<p>
			<b>Map:</b>{" "}
			<a href={html`/details/${props.item.map}`}>
				{(await search(props.item.map, true)).list.pop()?.name || props.item.map}
			</a>
		</p>
		<p>
			<b>Level:</b> {props.item.level || "N/A"}
		</p>
		<p>
			<b>HP:</b> {props.item.hp || "N/A"}
		</p>
		<p>
			<b>Element:</b> {props.item.ele || "N/A"}
		</p>
		<p>
			<b>EXP:</b> {props.item.exp || "N/A"}
		</p>
		<p>
			<b>Tamable:</b> {props.item.tamable || "N/A"}
		</p>
		{props.item.drops?.length > 0 && (
			<>
				<p>
					<b>Drops:</b>
				</p>
				<table class="striped no-padding">
					<tbody>
						{await Promise.all(
							props.item.drops?.map(async (drop) => {
								const dropItem = (await search(drop.id, true)).list.pop();

								return (
									<tr>
										<td>
											<a href={dropItem ? `/details/${drop.id}` : "#"}>
												{dropItem?.name || drop.id}
											</a>
										</td>
										<td>{dropItem?.type || "Unknown"}</td>
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
	</>
);
