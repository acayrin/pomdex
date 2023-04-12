import { Context } from "hono";
import { printGuide } from "../../../modules/leveling/functions/printGuide.js";
import { GuideResultSuccess } from "../../../modules/leveling/types/index.js";

export default (c: Context) =>
	new Promise((resolve) => {
		printGuide(c.req.param("query"))
			.then((data: GuideResultSuccess) => {
				resolve(c.json(data));
			})
			.catch((error) => {
				resolve(
					c.json({
						status: 400,
						message: "Failed to get level guide",
						error,
					})
				);
			});
	});
