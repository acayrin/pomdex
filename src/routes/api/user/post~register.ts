import { createHash } from "crypto";
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

			// check for existing username
			PomdexAccounts.findOne({
				username: json.username,
			})
				.then((account) => {
					if (account) {
						return res(
							c.json(
								{
									status: 403,
									message: "Username is already taken",
								},
								403
							)
						);
					}

					// create account
					const token = createHash("sha256")
						.update([Math.random() * 1e6, Date.now(), json.password].join(""))
						.digest("base64");

					PomdexAccounts.insertOne({
						username: json.username,
						password: json.password,
						token,
						type: "user",
						joinDate: Date.now(),
						lastOnline: Date.now(),
					})
						.then((_) => {
							c.cookie("pomdexAccount", token, {
								path: "/",
								sameSite: "Strict",
								httpOnly: true,
								secure: process.env.NODE_ENV === "production",
								maxAge: 7 * 24 * 3600, // 7 days
							});
							res(
								c.json({
									status: 200,
									message: "Registration successful",
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
