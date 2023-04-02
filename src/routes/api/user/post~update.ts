import { Context } from "hono";
import { PomdexAccounts } from "../../../modules/database/init.js";
import { createHash } from "crypto";

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

	const json: {
		data: {
			token?: string;
			username: string;
			emailAddress: string;
			password: string;
			type: "user" | "admin";
			favorites: string[];
		};
	} = await c.req.json();

	// check if token is valid
	try {
		if (json.data.password) {
			json.data.token = Buffer.from(
				createHash("sha256")
					.update([Math.random() * 1e6, Date.now(), json.data.password].join(""))
					.digest("hex")
			)
				.toString("base64")
				.replace("==", "");
		}
		const account = await PomdexAccounts.findOneAndUpdate(
			{
				token,
			},
			{
				$set: json.data,
			}
		);
		if (!account.ok) {
			return c.json({
				status: 400,
				message: "Failed to update info",
			});
		}

		return c.json({
			status: 200,
			message: "OK",
		});
	} catch {
		return c.json(
			{
				status: 500,
				message: "Internal server error",
			},
			500
		);
	}
};
