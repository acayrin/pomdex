import { ToramMap } from "../../../modules/types/ToramMap.js";

export const ManageEditMap = (props: { entry?: ToramMap }) => {
	const { entry } = props;
	return (
		<div class="row">
			<div class="col s12">
				<label for="edit_map_monster_list">
					Monster List
					<br />
					<p>
						Format: <span style="color:white">(Monster_ID)</span>
					</p>
				</label>
				<textarea
					id="edit_map_monster_list"
					class="materialize-textarea">
					{entry?.monsters?.map((monster) => `${monster}\n`)}
				</textarea>
			</div>
		</div>
	);
};
