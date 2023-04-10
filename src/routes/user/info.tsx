import { Context } from "hono";
import { BaseAccountInfo } from "../../components/user/info.js";
import { Base } from "../../components/_base/base.js";
import { PomdexAccounts } from "../../modules/database/index.js";

export default (c: Context) =>
	new Promise((res, rej) => {
		if (!c.req.cookie("pomdexAccount")) {
			res(c.redirect("/user/login", 403));
		}

		PomdexAccounts.findOne(
			{ token: c.req.cookie("pomdexAccount") },
			{
				projection: {
					token: 0,
				},
			}
		)
			.then((account) =>
				res(
					c.html(
						<Base
							title="Login"
							path={c.req.path}>
							<BaseAccountInfo account={account} />
						</Base>
					)
				)
			)
			.catch(rej);
	});
