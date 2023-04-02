import { Context } from "hono";
import { PomdexAccounts } from "../../../modules/database/init.js";
import { uploadFile } from "../../../modules/scraper/upload.js";

export default async (c: Context) => {
	if (
		!c.req.cookie("pomdexAccount") ||
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

	try {
		const file = Buffer.from(await c.req.arrayBuffer());
		const url = await uploadFile(file, `${Date.now().toString()}.jpg`);
		return c.json({
			status: 200,
			message: "Uploaded file",
			data: {
				url,
			},
		});
	} catch (err) {
		return c.json(
			{
				status: 400,
				message: `Failed to upload file`,
				error: err?.message,
			},
			400
		);
	}
};
