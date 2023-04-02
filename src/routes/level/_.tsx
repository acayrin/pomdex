import { Context } from "hono";
import { BaseLevel } from "../../components/level/base.js";
import { Base } from "../../components/_base/base.js";

export default async (c: Context) =>
	c.html(
		<Base
			title="Details"
			path={new URL(c.req.url).pathname}>
			<BaseLevel />
		</Base>
	);
