import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import { search } from "../../modules/search/query.js";
import { Helmet } from "../_base/helmet.js"
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseExplore = async () => (
	<>
		<div class="nav-wrapper col s12">
			<form>
				<div class="input-field hoverable">
					<input
						id="search"
						type="search"
						required
					/>
					<label
						class="label-icon"
						for="search">
						<i class="material-icons">search</i>
					</label>
					<i class="material-icons">close</i>
				</div>
			</form>
		</div>
		<div
			class="animate col s12"
			id="explorer"
			page="1">
			{(await search("*")).list.map((item) => (
				<div class="col s12 m6 l4">
					<div class="card hoverable">
						<div class="card-content">
							<span class="card-title">{item.name}</span>
							<b>{item.type}</b>
						</div>
						<div class="card-action">
							<a
								class="light-blue-text"
								href={`/details/${item.id}`}>
								View
							</a>
						</div>
					</div>
				</div>
			))}
		</div>
		<style>{Precompile.sass(join(__dirname, "./_static/css/explore.scss"))}</style>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/explore.ts"))}</Helmet.scripts.Push>
	</>
);
