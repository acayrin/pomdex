import { html } from "hono/html";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import { Helmet } from "../_base/helmet.js";
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

export const BaseManageNew = () => (
	<>
		<div class="card">
			<div class="card-content">
				<div class="row">
					<span class="col s12 card-title">Editting: New Entry</span>
				</div>
				<div class="row">
					<div class="col s12 input-field no-margin">
						<input
							id="edit_name"
							type="text"
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
							{ToramEntryType.map((type) => (
								<option value={type}>{type}</option>
							))}
						</select>
					</div>
				</div>
				<div id="edit_body">{<ManageEditMonster />}</div>
				<div class="row">
					<div
						class="col s12 btn waves-effect waves-light"
						id="edit_submit_new">
						New Entry
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
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/new.ts"))}</Helmet.scripts.Push>
		<style>{Precompile.sass(join(__dirname, "./_static/css/edit.scss"))}</style>
	</>
);
