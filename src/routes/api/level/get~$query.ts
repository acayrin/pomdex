import { Context } from "hono";
import { printGuide } from "../../../modules/leveling/printGuide.js";
import { GuideResult } from "../../../modules/leveling/types/levelGuide.js";

export default async (c: Context) => {
	const query = c.req.param("query");
	const guide = await printGuide(query, c.req.query("raw") !== undefined);

	if (guide.error) {
		return c.json(guide, 500);
	}
	if ((guide.data as GuideResult).list) {
		return c.json(guide.data);
	}
	return c.text(guide.data.toString());
};
