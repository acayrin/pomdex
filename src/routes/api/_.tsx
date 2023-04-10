import { Context } from "hono";
import { BaseApiFrontend } from "../../components/api/base.js";
import { Base } from "../../components/_base/base.js";

export default (c: Context) =>
	new Promise((res) => {
		BaseApiFrontend({ c }).then((children) =>
			res(
				c.html(
					<Base
						title="API"
						path="/api">
						{children}
					</Base>
				)
			)
		);
	});
