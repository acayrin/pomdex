import { Context } from "hono";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import { requestGetFileUrl } from "../../../modules/scraper/upload.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) => {
			c.req.json().then((json: { id: number; filename: string; upload_filename: string }) => {
				requestGetFileUrl(json.id, json.filename, json.upload_filename)
					.then((fileUrl) =>
						res(
							c.json({
								status: 200,
								message: "Uploaded file",
								data: {
									url: fileUrl.attachments[0].url,
								},
							})
						)
					)
					.catch((error) =>
						res(
							c.json(
								{
									status: 400,
									message: "Failed to upload file",
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
