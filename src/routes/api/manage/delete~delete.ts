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

	try {
		const { id } = await c.req.json();
		const res = await PomdexCollection.findOneAndDelete({
			id,
		});
		return res.value?.id
			? c.json({
					status: 200,
					message: "Deleted entry",
			  })
			: c.json(
					{
						status: 400,
						message: "Failed to delete entry",
					},
					400
			  );
	} catch (err) {
		return c.json(
			{
				status: 400,
				message: "Failed to delete entry",
				error: err,
			},
			400
		);
	}
};
