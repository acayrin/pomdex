import { Context } from "hono";
import { printGuide } from "../../../modules/leveling/functions/printGuide.js";
import { GuideResultSuccess } from "../../../modules/leveling/types/index.js";

export default (c: Context) =>
	new Promise((resolve) => {
		printGuide(c.req.param("query"))
			.then((data: GuideResultSuccess) => {
				resolve(
					c.json(data, 200, {
						"Access-Control-Allow-Origin": "*",
					})
				);
			})
			.catch((error) => {
				resolve(
					c.json(
						{
							status: 500,
							message: "Failed to get level guide",
							error,
						},
						500,
						{
							"Access-Control-Allow-Origin": "*",
						}
					)
				);
			});
	});
