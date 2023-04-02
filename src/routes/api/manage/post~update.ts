import { Context } from "hono";
import { PomdexAccounts, PomdexCollection } from "../../../modules/database/init.js";
import { ToramObject } from "../../../modules/_types/toram.js";

export default async (c: Context) => {
	if (
		!c.req.cookie("pomdexAccount") ||
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

	const json: ToramObject = await c.req.json();

	try {
		await PomdexCollection.findOneAndUpdate(
			{
				id: json.id,
			},
			{
				$set: json,
			}
		);
		return c.json({
			status: 200,
			message: "Updated entry",
		});
	} catch (err) {
		return c.json({
			status: 400,
			message: `Failed to update entry`,
			error: err,
		}, 400);
	}
};
