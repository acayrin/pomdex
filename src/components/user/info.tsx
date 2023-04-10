import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Precompile } from "../../modules/precompile/index.js";
import { Account } from "../../modules/types/Account.js";
import { Helmet } from "../_base/helmet.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseAccountInfo = (props: { account: Account }) => {
	const { account } = props;

	return (
		<div class="col s12">
			<div class="card">
				<div class="card-content">
					<div class="row">
						<div class="col s12">
							<span class="card-title">Welcome, {account.username}</span>

							<p>Type: {account.type.toUpperCase()}</p>
							<p>Joined date: {new Date(account.joinDate).toUTCString()}</p>
							<p>Email address: {account.emailAddress || "None"}</p>
						</div>
					</div>
				</div>
			</div>
			<div class="card">
				<div class="card-content">
					<div class="row">
						<div class="col s12">
							<span class="card-title">Update Information</span>
						</div>
						<div
							class="red col s12 hidden"
							id="response_message_info"
						/>
						<div class="col s12 input-field no-margin">
							<input
								id="info_email_address"
								type="text"
								required
							/>
							<label
								class="active"
								for="info_email_address">
								Email Address<span class="red">*</span>
							</label>
						</div>
						<div
							class="col s12 btn waves-effect waves-light"
							id="info_submit_info">
							Update
						</div>
					</div>
				</div>
			</div>
			<div class="card">
				<div class="card-content">
					<div class="row">
						<div class="col s12">
							<span class="card-title">Change Password</span>
						</div>
						<div
							class="red col s12 hidden"
							id="response_message_password"
						/>
						<div class="col s12 input-field no-margin">
							<input
								id="info_password"
								type="password"
								required
							/>
							<label
								class="active"
								for="info_password">
								Password<span class="red">*</span>
							</label>
						</div>
						<div class="col s12 input-field no-margin">
							<input
								id="info_password_confirm"
								type="password"
								required
							/>
							<label
								class="active"
								for="info_password_confirm">
								Confirm Password<span class="red">*</span>
							</label>
						</div>
						<div
							class="col s12 btn waves-effect waves-light"
							id="info_submit_password">
							Update
						</div>
					</div>
				</div>
			</div>

			<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/base.scss"))}</Helmet.styles.Push>
			<Helmet.scripts.Push>
				{Precompile.typescript(join(__dirname, "./_static/js/crypto.ts"))}
			</Helmet.scripts.Push>
			<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/info.ts"))}</Helmet.scripts.Push>
		</div>
	);
};
