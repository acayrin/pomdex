import { Context } from "hono";
import { BaseAccountInfo } from "../../components/user/info.js";
import { Base } from "../../components/_base/base.js";
import { PomdexAccounts } from "../../modules/database/init.js";

export default async (c: Context) => {
	if (!c.req.cookie("pomdexAccount")) {
		return c.redirect("/user/login");
	}

	const account = await PomdexAccounts.findOne({ token: c.req.cookie("pomdexAccount") });
	if (!account) {
		return c.redirect("/user/login");
	}

	account.token = undefined;

	return c.html(
		<Base title="Login">
			<BaseAccountInfo account={account} />
		</Base>
	);
};
