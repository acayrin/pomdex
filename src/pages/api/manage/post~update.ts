import { Context } from "hono";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import { PomdexCollection } from "../../../modules/database/index.js";
import { ToramObject } from "../../../modules/types/ToramObject.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) => {
			c.req.json().then((json: ToramObject) => {
				PomdexCollection.findOneAndUpdate(
					{
						id: json.id,
					},
					{
						$set: json,
					}
				)
					.then((response) =>
						response.value
							? res(
									c.json({
										status: 200,
										message: "Updated entry",
									})
							  )
							: res(
									c.json(
										{
											status: 400,
											message: "Failed to update entry",
										},
										400
									)
							  )
					)
					.catch((error) =>
						res(
							c.json(
								{
									status: 400,
									message: "Failed to update entry",
									error,
								},
								400
							)
						)
					);
			});
		}),
		{
			adminOnly: true,
		}
	);
