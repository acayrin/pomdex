import { Context } from "hono";
import { BaseLevel } from "../../components/level/base.js";
import { Base } from "../../layouts/base/base.js";

export default (c: Context) =>
	Promise.resolve(
		c.html(
			<Base
				title="Level"
				path={c.req.path}>
				<BaseLevel />
			</Base>
		)
	);
