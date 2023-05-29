import { Context } from "hono";
import Search from "../../../modules/search/query.js";

export default (c: Context) =>
	new Promise((res) => {
		Search.query(c.req.param("query") || "*").then((data) => {
			res(
				c.json(data, 200, {
					"Access-Control-Allow-Origin": "*",
				})
			);
		});
	});
