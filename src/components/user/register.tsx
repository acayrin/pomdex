import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Helmet } from "../../modules/helmet/helmet.js";
import { Precompile } from "../../modules/precompile/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseRegister = () => (
	<div class="col s12">
		<div class="card">
			<div class="card-content">
				<div class="row">
					<div class="card-title col s12">Register</div>
					<div
						class="red col s12 hidden"
						id="response_message"
					/>
					<div class="col s12 input-field no-margin">
						<input
							id="register_username"
							type="text"
							required
						/>
						<label
							class="active"
							for="register_username">
							Username<span class="red">*</span>
						</label>
					</div>
					<div class="col s12 input-field no-margin">
						<input
							id="register_password"
							type="password"
							required
						/>
						<label
							class="active"
							for="register_password">
							Password<span class="red">*</span>
						</label>
					</div>
					<div class="col s12 input-field no-margin">
						<input
							id="register_password_confirm"
							type="password"
							required
						/>
						<label
							class="active"
							for="register_password_confirm">
							Confirm Password<span class="red">*</span>
						</label>
					</div>
					<div class="col s12 input-field no-margin">
						<input
							id="register_email"
							type="text"
						/>
						<label
							class="active"
							for="register_email">
							Email
						</label>
					</div>
					<div
						class="col s4 btn waves-effect waves-light disabled"
						id="register_submit">
						Register
					</div>
				</div>
			</div>
		</div>

		<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}</Helmet.styles.Push>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/register.ts"))}</Helmet.scripts.Push>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/crypto.ts"))}</Helmet.scripts.Push>
	</div>
);
