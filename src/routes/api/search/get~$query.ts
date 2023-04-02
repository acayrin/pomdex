import { Context } from "hono";
import { search } from "../../../modules/search/query.js";

export default async (c: Context) => {
	const query = c.req.param("query") || "*";

	let page = -1;
	try {
		page = Number(c.req.query("page"));
	} catch (_) {}
	let limit = -1;
	try {
		limit = Number(c.req.query("limit"));
	} catch (_) {}

	return page >= 0
		? c.json((await search(`${query} -p ${page - 1}`)).list)
		: limit > 0
		? c.json(await search(`${query} -l ${limit}`))
		: c.json((await search(query)).list);
};
