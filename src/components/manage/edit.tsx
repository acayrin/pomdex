import { html } from "hono/html";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Helmet } from "../../modules/helmet/helmet.js";
import { Precompile } from "../../modules/precompile/index.js";
import { ToramItem } from "../../modules/types/ToramItem.js";
import { ToramMap } from "../../modules/types/ToramMap.js";
import { ToramMonster } from "../../modules/types/ToramMonster.js";
import { ToramObject } from "../../modules/types/ToramObject.js";
import { ManageEditItem } from "./edit/item.js";
import { ManageEditMap } from "./edit/map.js";
import { ManageEditMonster } from "./edit/monster.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

const ToramEntryType = [
	"Boss - Ultimate",
	"Boss - Nightmare",
	"Boss - Hard",
	"Boss - Normal",
	"Boss - Easy",
	"Miniboss",
	"Monster",
	"Material",
	"Map",
	"Additional",
	"Armor",
	"Bow",
	"Bowgun",
	"1 Handed Sword",
	"2 Handed Sword",
	"Halberd",
	"Staff",
	"Magic Device",
	"Katana",
	"Knuckles",
	"Normal Crysta",
	"Armor Crysta",
	"Weapon Crysta",
	"Additional Crysta",
	"Special Crysta",
	"Enhancer Crysta Red",
	"Enhancer Crysta Blue",
	"Enhancer Crysta Yellow",
	"Enhancer Crysta Green",
	"Enhancer Crysta Purple",
	"Unknown",
];

export const BaseManageEdit = (props: { entry?: ToramObject }) => {
	const { entry } = props;

	return (
		<div class="col s12">
			<div class="card">
				<div class="card-content">
					<span
						id="edit_id"
						class="hidden">
						{entry?.id}
					</span>
					<div class="row">
						<span class="col s12 card-title">Editting: {entry?.name || "New"}</span>
					</div>
					<div class="row">
						<div class="col s12 input-field no-margin">
							<input
								id="edit_name"
								type="text"
								value={entry?.name}
								required
							/>
							<label
								class="active"
								for="edit_name">
								Name
							</label>
						</div>
					</div>
					<div class="row">
						<div class="col s12">
							<label for="edit_type">Type</label>
							<select
								id="edit_type"
								class="browser-default grey darken-4">
								{ToramEntryType.map((type) =>
									entry?.type === type ? (
										<option
											key={type}
											value={type}
											selected>
											{type}
										</option>
									) : (
										<option
											key={type}
											value={type}>
											{type}
										</option>
									)
								)}
							</select>
						</div>
					</div>
					<div id="edit_body">
						{entry.type === "Map" && <ManageEditMap entry={entry as ToramMap} />}
						{(entry as ToramMonster).level !== undefined && (
							<ManageEditMonster entry={entry as ToramMonster} />
						)}
						{(entry as ToramItem).stats !== undefined && <ManageEditItem entry={entry as ToramItem} />}
					</div>
					<div class="row">
						<div
							class="col s12 btn waves-effect waves-light"
							id="edit_submit_update">
							Update Entry
						</div>
					</div>
				</div>
			</div>
			<Helmet.scripts.Push>
				{html(
					`
					const type = document.getElementById("edit_type");
					type.addEventListener("change", () => {
                        if (type.value.includes("Monster") || type.value.toLowerCase().includes("boss")) {
						    document.getElementById("edit_body").innerHTML = '${(<ManageEditMonster />)}';
                        }
                        else if (type.value === "Map") {
						    document.getElementById("edit_body").innerHTML = '${(<ManageEditMap />)}';
                        }
                        else {
						    document.getElementById("edit_body").innerHTML = '${(<ManageEditItem />)}';
                        }
					});
                `.replace(/( {2,})|(\n)/gi, "") as unknown as TemplateStringsArray
				)}
			</Helmet.scripts.Push>
			<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/edit.ts"))}</Helmet.scripts.Push>
			<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/edit.scss"))}</Helmet.styles.Push>
		</div>
	);
};
