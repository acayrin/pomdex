import { Context } from "hono";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import { PomdexCollection } from "../../../modules/database/index.js";
import { ToramObject } from "../../../modules/types/ToramObject.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) => {
			c.req.json().then(async (json: ToramObject) => {
				if (json.type === "Map") {
					const list = (
						await PomdexCollection.find({
							type: "Map",
						}).toArray()
					).sort((a, b) => Number(b.id.replace(/\D+/gi, "")) - Number(a.id.replace(/\D+/gi, "")));

					json.id = `M${Number(list.at(0).id.replace("M", "")) + 1}`;
				} else if (json.type.includes("Monster") || json.type.toLowerCase().includes("boss")) {
					const list = (
						await PomdexCollection.find({
							type: {
								$regex: /(monster)|(boss)/gi,
							},
						}).toArray()
					).sort((a, b) => Number(b.id.replace(/\D+/gi, "")) - Number(a.id.replace(/\D+/gi, "")));

					json.id = `E${Number(list.at(0).id.replace("E", "")) + 1}`;
				} else {
					const list = (
						await PomdexCollection.find({
							type: {
								$not: {
									$regex: /(monster)|(boss)|(map)/gi,
								},
							},
						}).toArray()
					).sort((a, b) => Number(b.id.replace(/\D+/gi, "")) - Number(a.id.replace(/\D+/gi, "")));

					json.id = `T${Number(list.at(0).id.replace("T", "")) + 1}`;
				}

				if ((await PomdexCollection.findOne({ id: json.id }))?.id) {
					return res(
						c.json(
							{
								status: 400,
								message: `Duplicate entry ID ${json.id}`,
							},
							400
						)
					);
				}

				PomdexCollection.insertOne(json)
					.then((response) =>
						res(
							c.json({
								status: 200,
								message: `Added entry ID ${json.id}. Server: ${response.acknowledged}`,
							})
						)
					)
					.catch((error) =>
						res(
							c.json(
								{
									status: 400,
									message: "Failed to create entry",
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
