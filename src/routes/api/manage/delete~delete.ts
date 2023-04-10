import { Context } from "hono";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import { PomdexCollection } from "../../../modules/database/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) =>
			c.req.json().then((json: { id: string }) => {
				PomdexCollection.findOneAndDelete({
					id: json.id,
				})
					.then((data) =>
						data.value?.id
							? res(
									c.json({
										status: 200,
										message: "Deleted entry",
									})
							  )
							: res(
									c.json(
										{
											status: 400,
											message: "Failed to delete entry",
										},
										400
									)
							  )
					)
					.catch((error) => {
						res(
							c.json(
								{
									status: 400,
									message: "Failed to delete entry",
									error,
								},
								400
							)
						);
					});
			})
		),
		{
			adminOnly: true
		}
	);
