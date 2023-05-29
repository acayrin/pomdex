import { Context } from "hono";
import { BaseExplorer } from "../components/explorer/base.js";
import { Base } from "../layouts/base/base.js";;

export default (c: Context) =>
	Promise.resolve(
		c.html(
			<Base
				title="Item Explorer"
				path="/explorer">
				<BaseExplorer />
			</Base>
		)
	);
