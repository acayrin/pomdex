import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import { Helmet } from "../_base/helmet.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseLogin = () => (
	<div class="col s12">
		<div class="card">
			<div class="card-content">
				<div class="row">
					<div class="card-title col s12">Login</div>
					<div
						class="red col s12 hidden"
						id="response_message"
					/>
					<div class="col s12 input-field no-margin">
						<input
							id="login_username"
							type="text"
							required
						/>
						<label
							class="active"
							for="login_username">
							Username<span class="red">*</span>
						</label>
					</div>
					<div class="col s12 input-field no-margin">
						<input
							id="login_password"
							type="password"
							required
						/>
						<label
							class="active"
							for="login_password">
							Password<span class="red">*</span>
						</label>
					</div>
					<div
						class="col s4 btn waves-effect waves-light disabled"
						id="login_submit">
						Login
					</div>
				</div>
			</div>
		</div>

		<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}</Helmet.styles.Push>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/login.ts"))}</Helmet.scripts.Push>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/crypto.ts"))}</Helmet.scripts.Push>
	</div>
);
