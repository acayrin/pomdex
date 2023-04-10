import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import { Helmet } from "../_base/helmet.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseExplorer = () => (
	<>
		<div class="col s12 explorer-option-container">
			<div>
				<div
					id="explorer-option-panel"
					class="card hoverable animate active">
					<div class="card-content">
						<div>
							<b>Weapons:</b>
							<label>
								<input
									type="checkbox"
									value="1 handed sword"
								/>
								<span>1 Handed Sword</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="2 handed sword"
								/>
								<span>2 Handed Sword</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="staff"
								/>
								<span>Staff</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="magic device"
								/>
								<span>Magic Device</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="!bow"
								/>
								<span>Bow</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="bowgun"
								/>
								<span>Bowgun</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="halberd"
								/>
								<span>Halberd</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="katana"
								/>
								<span>Katana</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="knuckles"
								/>
								<span>Knuckles</span>
							</label>
						</div>
						<div>
							<b>Sub Weapons:</b>
							<label>
								<input
									type="checkbox"
									value="arrow"
								/>
								<span>Arrow</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="dagger"
								/>
								<span>Dagger</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="shield"
								/>
								<span>Shield</span>
							</label>
						</div>
						<div>
							<b>Equipments:</b>
							<label>
								<input
									type="checkbox"
									value="!additional"
								/>
								<span>Additional</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="!armor"
								/>
								<span>Armor</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="!special"
								/>
								<span>Special</span>
							</label>
						</div>
						<div class="divider" />
						<div>
							<b>Monsters:</b>
							<label>
								<input
									type="checkbox"
									value="monster"
								/>
								<span>Normal monster</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="miniboss"
								/>
								<span>Miniboss</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="boss - easy"
								/>
								<span>Boss - Easy</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="boss - normal"
								/>
								<span>Boss - Normal</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="boss - hard"
								/>
								<span>Boss - Hard</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="boss - nightmare"
								/>
								<span>Boss - Nightmare</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="boss - ultimate"
								/>
								<span>Boss - Ultimate</span>
							</label>
						</div>
						<div class="divider" />
						<div>
							<b>Crysta:</b>
							<label>
								<input
									type="checkbox"
									value="normal crysta"
								/>
								<span>Normal Crysta</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="weapon crysta"
								/>
								<span>Weapon Crysta</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="additional crysta"
								/>
								<span>Additional Crysta</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="armor crysta"
								/>
								<span>Armor Crysta</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="special crysta"
								/>
								<span>Special Crysta</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="enhancer crysta blue"
								/>
								<span>Enhancer Crysta Blue</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="enhancer crysta red"
								/>
								<span>Enhancer Crysta Red</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="enhancer crysta yellow"
								/>
								<span>Enhancer Crysta Yellow</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="enhancer crysta green"
								/>
								<span>Enhancer Crysta Green</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="enhancer crysta purple"
								/>
								<span>Enhancer Crysta Purple</span>
							</label>
						</div>
						<div class="divider" />
						<div>
							<b>Others:</b>
							<label>
								<input
									type="checkbox"
									value="map"
								/>
								<span>Map</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="material"
								/>
								<span>Material</span>
							</label>
							<label>
								<input
									type="checkbox"
									value="usable"
								/>
								<span>Usable</span>
							</label>
						</div>
					</div>
				</div>
			</div>
			<div class="explorer-search-container nav-wrapper col s10">
				<div class="explorer-search-bar input-field">
					<input
						id="search"
						type="search"
						class="animate"
						required
					/>
					<label
						class="label-icon"
						for="search">
						<iconify-icon
							class="iconify animate"
							icon="material-symbols:search-rounded"
							width="24"
						/>
					</label>
				</div>
			</div>
			<div class="explorer-option-toggle-container input-field col s2">
				<a
					id="explorer-option-toggle"
					class="btn-floating btn-large waves-effect waves-light animate">
					<iconify-icon
						class="iconify animate"
						icon="mdi:cog"
						width="22"
					/>
				</a>
			</div>
		</div>
		<div class="col s12">
			<div
				class="animate col"
				id="explorer"
				page="1"
			/>
		</div>

		<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/explorer.scss"))}</Helmet.styles.Push>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/explorer.ts"))}</Helmet.scripts.Push>
	</>
);
