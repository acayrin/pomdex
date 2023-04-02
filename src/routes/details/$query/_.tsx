import Critters from "critters";
import { Context } from "hono";
import { BaseDetails } from "../../../components/details/base.js";
import { Base } from "../../../components/_base/base.js";
import { search } from "../../../modules/search/query.js";

export default async (c: Context) => {
	const item = (await search(c.req.param("query"))).list.pop();

	if (!item) return c.redirect("/404");

	return c.html(
		await new Critters({
			logLevel: "silent",
		}).process(
			(
				<Base title="Details">
					<BaseDetails />
				</Base>
			).toString()
		)
	);
};
