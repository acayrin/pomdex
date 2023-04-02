import { Context } from "hono";
import { E404 } from "../../../components/errors/404.js";
import { BaseManageEdit } from "../../../components/manage/edit.js";
import { Base } from "../../../components/_base/base.js";
import { PomdexAccounts } from "../../../modules/database/init.js";
import { search } from "../../../modules/search/query.js";

export default async (c: Context) => {
	if (
		!c.req.cookie("pomdexAccount") ||
		(
			await PomdexAccounts.findOne({
				token: c.req.cookie("pomdexAccount"),
			})
		)?.type !== "admin"
	) {
		return c.text("Access denied", 500);
	}

	const id = c.req.param("id");
	const entry = (await search(id)).list.shift();
	if (!id || !entry) {
		return c.html(
			<Base title={`Editting ${id}`}>
				<E404 />
			</Base>
		);
	}

	return c.html(
		<Base title={`Editting ${id}`}>
			<BaseManageEdit entry={entry} />
		</Base>
	);
};
