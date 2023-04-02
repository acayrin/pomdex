import { Context } from "hono";
import { BaseDetails } from "../../components/details/base.js";
import { Base } from "../../components/_base/base.js";

export default async (c: Context) =>
	c.html(
		<Base
			title="Details"
			path="/details">
			<BaseDetails />
		</Base>
	);
