import { ToramItem } from "../../../modules/_types/item.js";

export const ManageEditItem = (props: { entry?: ToramItem }) => {
	const { entry } = props;

	return (
		<>
			<div class="row">
				<div class="col s4 input-field no-margin">
					<input
						id="edit_item_sell"
						type="number"
						value={entry?.sell}
					/>
					<label for="edit_item_sell">Sell</label>
				</div>
				<div class="col s4 input-field no-margin">
					<input
						id="edit_item_proc"
						type="text"
						value={entry?.proc}
					/>
					<label for="edit_item_proc">Process</label>
				</div>
				<div class="col s4 input-field no-margin">
					<input
						id="edit_item_thumb"
						type="text"
						value={entry?.thumb}
					/>
					<label for="edit_item_thumb">Thumbnail URL</label>
				</div>
			</div>
			<div class="row">
				<div class="col s12">
					<label for="edit_item_stats">
						Stat List
						<br />
						<p>
							Format: <span style="color:white">(Stat_name Amount)</span>
						</p>
					</label>
					<textarea
						id="edit_item_stats"
						class="materialize-textarea">
						{entry?.stats?.map((stat) => `${stat}\n`)}
					</textarea>
				</div>
			</div>
			<div class="row">
				<div class="col s12">
					<label for="edit_item_drop_from">
						Obtainable from List
						<br />
						<p>
							Format: <span style="color:white">(Monster_ID)</span>
							<span style="color:grey">_[Dye A]_[Dye B]_[Dye C]</span>
						</p>
					</label>
					<textarea
						id="edit_item_drop_from"
						class="materialize-textarea">
						{entry?.drops?.map((monster) => `${monster.from}_${monster.dyes.join("_")}\n`)}
					</textarea>
				</div>
			</div>
			<div class="row">
				<div class="col s12">
					<label for="edit_item_usages">
						Usages List
						<br />
						<p>
							Format: <span style="color:white">(Item_ID)_[Amount]</span>
						</p>
					</label>
					<textarea
						id="edit_item_usages"
						class="materialize-textarea">
						{entry?.uses?.map((use) => `${use.for}_${use.amount}\n`)}
					</textarea>
				</div>
			</div>
			<div class="row">
				<div class="col s12">Crafting Recipe:</div>
			</div>
			<div class="row">
				<div class="col s6 input-field no-margin">
					<input
						id="edit_item_recipe_fee"
						type="number"
						value={entry?.recipe?.fee}
					/>
					<label for="edit_item_recipe_fee">Fee</label>
				</div>
				<div class="col s6 input-field no-margin">
					<input
						id="edit_item_recipe_set"
						type="number"
						value={entry?.recipe?.set}
					/>
					<label for="edit_item_recipe_set">Set</label>
				</div>
			</div>
			<div class="row">
				<div class="col s6 input-field no-margin">
					<input
						id="edit_item_recipe_level"
						type="number"
						value={entry?.recipe?.level}
					/>
					<label for="edit_item_recipe_level">Level</label>
				</div>
				<div class="col s6 input-field no-margin">
					<input
						id="edit_item_recipe_difficulty"
						type="number"
						value={entry?.recipe?.difficulty}
					/>
					<label for="edit_item_recipe_difficulty">Difficulty</label>
				</div>
			</div>
			<div class="row">
				<div class="col s12">
					<label for="edit_item_recipe_materials">
						Recipe Material List
						<br />
						<p>
							Format: <span style="color:white">(Item_ID)_[Amount]</span>
						</p>
					</label>
					<textarea
						id="edit_item_recipe_materials"
						class="materialize-textarea">
						{entry?.recipe?.materials?.map((mat) => `${mat.item}_${mat.amount}\n`)}
					</textarea>
				</div>
			</div>
		</>
	);
};
