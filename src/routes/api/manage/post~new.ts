import { Context } from "hono";
import { PomdexAccounts, PomdexCollection } from "../../../modules/database/init.js";
import { ToramObject } from "../../../modules/_types/toram.js";

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

	const json: ToramObject = await c.req.json();

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
		return c.json({
			status: 400,
			message: `Duplicate entry ID ${json.id}`,
		}, 400);
	}

	try {
		const entry = await PomdexCollection.insertOne(json);
		return c.json({
			status: 200,
			message: `Added entry ID ${json.id}. Server: ${entry.acknowledged}`,
		});
	} catch (err) {
		return c.json({
			status: 400,
			message: `Failed to create entry`,
			error: err,
		}, 400);
	}
};
