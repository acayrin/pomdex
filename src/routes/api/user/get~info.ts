import { Context } from "hono";
import { PomdexAccounts } from "../../../modules/database/init.js";

export default async (c: Context) => {
	const token = c.req.cookie("pomdexAccount");

	if (
		!token ||
		(
			await PomdexAccounts.findOne({
				token: c.req.cookie("pomdexAccount"),
			})
		)?.type !== "admin"
	) {
		return c.json(
			{
				status: 403,
				message: "Access denied",
			},
			403
		);
	}

	// check if token is valid
	const account = await PomdexAccounts.findOne({
		token,
	});

	if (!account) {
		return c.json(
			{
				status: 400,
				message: "Invalid request",
			},
			400
		);
	}

	// strip token
	account.token = undefined;
	return c.json({
		status: 200,
		message: "OK",
		data: account,
	});
};
