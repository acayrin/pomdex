import { ToramMonster } from "../../../modules/types/ToramMonster.js";

const ToramElements = ["Neutral", "Fire", "Earth", "Water", "Wind", "Light", "Dark"];
const ToramTamable = ["Yes", "No"];

export const ManageEditMonster = (props: { entry?: ToramMonster }) => {
	const { entry } = props;

	return (
		<>
			<div class="row">
				<div class="col s6 input-field no-margin">
					<input
						id="edit_monster_level"
						type="number"
						value={entry?.level}
						required
					/>
					<label for="edit_monster_level">Level</label>
				</div>
				<div class="col s6 input-field no-margin">
					<input
						id="edit_monster_exp"
						type="number"
						value={entry?.exp}
						required
					/>
					<label for="edit_monster_exp">EXP Amount</label>
				</div>
			</div>
			<div class="row">
				<div class="col s6 input-field no-margin">
					<input
						id="edit_monster_hp"
						type="number"
						value={entry?.hp}
						required
					/>
					<label for="edit_monster_hp">Hitpoints</label>
				</div>
				<div class="col s6 input-field no-margin">
					<input
						id="edit_monster_map"
						type="number"
						value={entry?.map}
						required
					/>
					<label for="edit_monster_map">Map</label>
				</div>
			</div>
			<div class="row">
				<div class="col s6">
					<label for="edit_monster_tamable">Tamable</label>
					<select
						id="edit_monster_tamable"
						class="browser-default grey darken-4">
						{ToramTamable.map((state) =>
							entry?.tamable === state ? (
								<option
									value={state}
									selected>
									{state}
								</option>
							) : (
								<option value={state}>{state}</option>
							)
						)}
					</select>
				</div>
				<div class="col s6">
					<label for="edit_monster_element">Element</label>
					<select
						id="edit_monster_element"
						class="browser-default grey darken-4">
						{ToramElements.map((element) =>
							entry?.ele.includes(element) ? (
								<option
									value={element}
									selected>
									{element}
								</option>
							) : (
								<option value={element}>{element}</option>
							)
						)}
					</select>
				</div>
			</div>
			<div class="row">
				<div class="col s12">
					<label for="edit_monster_drops">
						Monster Drops
						<br />
						<p>
							Format: <span style="color:white">(Item_ID)</span>
							<span style="color:grey">_[Dye A]_[Dye B]_[Dye C]</span>
						</p>
					</label>
					<textarea
						id="edit_monster_drops"
						class="materialize-textarea">
						{entry?.drops?.map((drop) => `${drop.id}_${drop.dyes.join("_")}\n`)}
					</textarea>
				</div>
			</div>
		</>
	);
};
