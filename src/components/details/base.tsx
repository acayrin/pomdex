import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import { Helmet } from "../_base/helmet.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseDetails = () => (
	<div class="col s12">
		<div
			id="lazyRender"
			class="animate">
			<div class="card">
				<div class="card-content">
					<div class="progress light-blue">
						<div class="indeterminate light-blue darken-4" />
					</div>
				</div>
			</div>
		</div>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/lazyLoad.ts"))}</Helmet.scripts.Push>
	</div>
);
