import Critters from "critters";
import { Context } from "hono";
import { LazyDetails } from "../../../components/details/lazy.js";
import { search } from "../../../modules/search/query.js";

export default async (c: Context) => {
	const item = (await search(c.req.param("query"))).list.pop();

	return item
		? c.html(
				await new Critters({
					logLevel: "silent",
				}).process((await LazyDetails({ item })).toString())
		  )
		: c.text("", 404);
};
