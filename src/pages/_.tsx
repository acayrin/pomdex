import { Context } from "hono";
import { Base } from "../layouts/base/base.js";
import { BaseHome } from "../components/home.js";

export default (c: Context) =>
	Promise.resolve(
		c.html(
			<Base
				title="Home"
				path="/">
				<BaseHome />
			</Base>
		)
	);
