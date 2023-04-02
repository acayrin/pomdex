import { html } from "hono/html";
import { join } from "path";
import { Precompile } from "../../modules/precompile/index.js";
import { ToramItem } from "../../modules/_types/item.js";
import { ToramMap } from "../../modules/_types/map.js";
import { ToramMonster } from "../../modules/_types/monster.js";
import { precompiled } from "../_base/_static/precompile.js";
import { ItemDetails } from "./item.js";
import { MapDetails } from "./map.js";
import { MonsterDetails } from "./monster.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const LazyDetails = async (props: { item: ToramItem | ToramMap | ToramMonster }) => (
	<div class="card">
		<div class="card-content">
			<span class="card-title">{props.item.name}</span>

			<div class="section card-display-item">
				{(props.item as ToramItem).proc !== undefined
					? await ItemDetails({ item: props.item as ToramItem })
					: (props.item as ToramMonster).level !== undefined
					? await MonsterDetails({ item: props.item as ToramMonster })
					: await MapDetails({ item: props.item as ToramMap })}
			</div>

			<div class="section">
				<p>
					Last modified: <span id="lastModified" />
				</p>
				<p>
					<a
						href={`/api/search/${props.item.id}`}
						target="_blank"
						rel="noreferrer">
						View API
					</a>
				</p>
			</div>
		</div>
		<style>
			{html(precompiled.styles.materialize as unknown as TemplateStringsArray)}
			{html(precompiled.styles.base as unknown as TemplateStringsArray)}
			{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}
		</style>
	</div>
);
