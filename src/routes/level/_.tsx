import { Context } from "hono";
import { BaseLevel } from "../../components/level/base.js";
import { Base } from "../../components/_base/base.js";

export default (c: Context) =>
	new Promise((res) => {
		res(
			c.html(
				<Base
					title="Level"
					path={c.req.path}>
					<BaseLevel />
				</Base>
			)
		);
	});
