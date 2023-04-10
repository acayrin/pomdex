import { Context } from "hono";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import { PomdexAccounts } from "../../../modules/database/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) => {
			PomdexAccounts.findOne(
				{
					token: c.req.cookie("pomdexAccount"),
				},
				{
					projection: {
						_id: 0,
						token: 0,
						password: 0,
					},
				}
			)
				.then((account) => {
					res(
						c.json({
							status: 200,
							message: "OK",
							data: account,
						})
					);
				})
				.catch((err) =>
					res(
						c.json({
							status: 500,
							message: "Internal server error",
							error: err,
						})
					)
				);
		}),
		{
			redirect: false,
		}
	);
