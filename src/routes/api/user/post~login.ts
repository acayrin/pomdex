import { Context } from "hono";
import { PomdexAccounts } from "../../../modules/database/index.js";

export default (c: Context) =>
	new Promise((res) => {
		c.req.json().then((json: { username: string; password: string }) => {
			// request invalid
			if (!json.username || !json.password) {
				return res(
					c.json(
						{
							status: 400,
							message: "Missing username or password",
						},
						400
					)
				);
			}

			// invalid password length
			if (json.password.length < 8) {
				return res(
					c.json(
						{
							status: 400,
							message: "Password must be at least 8 characters",
						},
						400
					)
				);
			}

			PomdexAccounts.findOne({
				username: json.username,
				password: json.password,
			})
				.then((account) => {
					if (!account) {
						return res(
							c.json(
								{
									status: 403,
									message: "Invalid username or password",
								},
								403
							)
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
					res(
						c.json({
							status: 200,
							message: "Login successful",
						})
					);
				})
				.catch((err) =>
					res(
						c.json(
							{
								status: 500,
								message: "Internal server error",
								error: err,
							},
							500
						)
					)
				);
		});
	});
