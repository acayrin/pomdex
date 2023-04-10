import { Context } from "hono";
import { printGuide } from "../../../modules/leveling/printGuide.js";
import { GuideResultError, GuideResultSuccess } from "../../../modules/leveling/types/index.js";

export default (c: Context) =>
	new Promise((res) => {
		printGuide(c.req.param("query")).then((data) => {
			if ((data as GuideResultError).error) {
				return res(
					c.json({
						status: 400,
						message: "Failed to get level guide",
						error: (data as GuideResultError).error,
					})
				);
			}

			if ((data as GuideResultSuccess).list) {
				return res(c.json(data));
			}

			res(c.text(data.toString()));
		});
	});
