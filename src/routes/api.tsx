import { Context } from "hono";
import { BaseApiFrontend } from "../components/api/base.js";
import { Base } from "../components/_base/base.js";

export default async (c: Context) =>
	c.html(
		<Base
			title="API"
			path="/api">
			{await BaseApiFrontend({ c })}
		</Base>
	);
