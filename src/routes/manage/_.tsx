import { Context } from "hono";
import { BaseManageList } from "../../components/manage/base.js";
import { Base } from "../../components/_base/base.js";
import { PomdexAccounts } from "../../modules/database/init.js";

export default async (c: Context) => {
	if (
		!c.req.cookie("pomdexAccount") ||
		(
			await PomdexAccounts.findOne({
				token: c.req.cookie("pomdexAccount"),
			})
		)?.type !== "admin"
	) {
		return c.redirect("/user/login");
	}

	return c.html(<Base title="Manage">{await BaseManageList()}</Base>);
};
