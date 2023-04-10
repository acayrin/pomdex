import { Context } from "hono";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import { requestDiscordUploadURL } from "../../../modules/scraper/upload.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) => {
			const filename = c.req.query("filename") || `${Date.now().toString()}.jpg`;
			requestDiscordUploadURL(filename)
				.then((upload_data) =>
					res(
						c.json({
							status: 200,
							data: {
								filename,
								upload_data,
							},
						})
					)
				)
				.catch((error) =>
					res(
						c.json(
							{
								status: 400,
								message: `Failed to upload file`,
								error,
							},
							400
						)
					)
				);
		}),
		{
			adminOnly: true,
		}
	);
