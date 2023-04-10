import { Context } from "hono";
import { BaseExplorer } from "../components/explorer/base.js";
import { Base } from "../components/_base/base.js";

export default (c: Context) =>
	new Promise((res) => {
		res(
			c.html(
				<Base
					title="Item Explorer"
					path="/explorer">
					<BaseExplorer />
				</Base>
			)
		);
	});
