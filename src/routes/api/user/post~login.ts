import { Context } from "hono";
import { PomdexAccounts } from "../../../modules/database/init.js";

export default async (c: Context) => {
	const json: {
		username: string;
		password: string;
	} = await c.req.json();

	// request invalid
	if (!json.username || !json.password) {
		return c.json(
			{
				status: 400,
				message: "Missing username or password",
			},
			400
		);
	}

	// invalid password length
	if (json.password.length < 8) {
		return c.json(
			{
				status: 400,
				message: "Password must be at least 8 characters",
			},
			400
		);
	}

	try {
		const account = await PomdexAccounts.findOne({
			username: json.username,
			password: json.password,
		});
		if (!account) {
			return c.json(
				{
					status: 400,
					message: "Invalid username or password",
				},
				400
			);
		}

		// request valid
		c.cookie("pomdexAccount", account.token, {
			path: "/",
			sameSite: "Strict",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 3600, // 7 days
		});
		return c.json({
			status: 200,
			message: "Login successful",
			data: {
				token: account.token,
			},
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
