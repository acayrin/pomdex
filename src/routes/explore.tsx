import { Context } from "hono";
import { BaseExplore } from "../components/explore/base.js";
import { Base } from "../components/_base/base.js";

export default async (c: Context) =>
	c.html(
		<Base
			title="Explore"
			path="/explore">
			{await BaseExplore()}
		</Base>
	);
