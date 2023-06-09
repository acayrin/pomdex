import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Helmet } from "../../modules/helmet/helmet.js";
import { Precompile } from "../../modules/precompile/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const BaseManageUpload = () => (
	<div class="col s12">
		<div class="card">
			<div class="card-content">
				<div class="row">
					<div class="col s12">
						<div class="file-field input-field">
							<div class="btn">
								<span>File</span>
								<input
									type="file"
									id="upload_file"
								/>
							</div>
							<div class="file-path-wrapper">
								<input
									class="file-path validate"
									type="text"
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div
						class="col s12 btn waves-effect waves-light"
						id="upload_submit">
						Upload
					</div>
				</div>
				<div class="row">
					<div class="col s12">
						<span id="upload_response" />
					</div>
				</div>
			</div>
		</div>
		<Helmet.styles.Push>{Precompile.sass(join(__dirname, "./_static/css/upload.scss"))}</Helmet.styles.Push>
		<Helmet.scripts.Push>{Precompile.typescript(join(__dirname, "./_static/js/upload.ts"))}</Helmet.scripts.Push>
	</div>
);
