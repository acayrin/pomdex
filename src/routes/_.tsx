import { Context } from "hono";
import { Base } from "../components/_base/base.js";
import { BaseHome } from "../components/_base/home.js";

export default (c: Context) =>
	new Promise((res) => {
		res(
			c.html(
				<Base
					title="Home"
					path="/">
					<BaseHome />
				</Base>
			)
		);
	});
