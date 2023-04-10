import { createHash } from "crypto";
import { Context } from "hono";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import { PomdexAccounts } from "../../../modules/database/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) => {
			c.req.json().then(
				(json: {
					data: {
						token?: string;
						username: string;
						emailAddress: string;
						password: string;
						type: "user" | "admin";
						favorites: string[];
					};
				}) => {
					if (json.data.password) {
						json.data.token = Buffer.from(
							createHash("sha256")
								.update([Math.random() * 1e6, Date.now(), json.data.password].join(""))
								.digest("hex")
						)
							.toString("base64")
							.replace("==", "");
					}

					PomdexAccounts.findOneAndUpdate(
						{
							token: c.req.cookie("pomdexAccount"),
						},
						{
							$set: json.data,
						}
					).then((status) => {
						if (!status.ok) {
							return res(
								c.json({
									status: 400,
									message: "Failed to update info",
								})
							);
						}

						res(
							c.json({
								status: 200,
								message: "OK",
							})
						);
					});
				}
			);
		})
	);
