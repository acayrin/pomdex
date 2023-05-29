import { Context } from "hono";
import { BaseDetails } from "../../../components/details/base.js";
import { Base } from "../../../layouts/base/base.js";
import Search from "../../../modules/search/query.js";

export default (c: Context) =>
	new Promise((res) => {
		Search.query(c.req.param("query")).then((data) => {
			const item = data.list.at(0);

			if (!item) return res(c.redirect("/404"));

			BaseDetails({ item }).then((children) => {
				res(c.html(<Base title={`Details - ${item.name}`}>{children}</Base>));
			});
		});
	});
