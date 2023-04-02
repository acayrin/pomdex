import { Context } from "hono";
import { PomdexAccounts } from "../../../modules/database/init.js";
import { createHash } from "crypto";

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

	// check for existing username
	const account = await PomdexAccounts.findOne({
		username: json.username,
	});
	if (account) {
		return c.json(
			{
				status: 400,
				message: "Username is already taken",
			},
			400
		);
	}

	// create account
	const token = createHash("sha256")
		.update([Math.random() * 1e6, Date.now(), json.password].join(""))
		.digest("base64");

	try {
		await PomdexAccounts.insertOne({
			username: json.username,
			password: json.password,
			token,
			type: "user",
			joinDate: Date.now(),
			lastOnline: Date.now(),
		});

		c.cookie("pomdexAccount", token, {
			path: "/",
			sameSite: "Strict",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 7 * 24 * 3600, // 7 days
		});
		return c.json({
			status: 200,
			message: "Registration successful",
			data: {
				token,
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
