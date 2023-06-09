import { Context } from "hono";
import { E404 } from "../../../components/errors/404.js";
import { BaseManageEdit } from "../../../components/manage/edit.js";
import { Base } from "../../../layouts/base/base.js";
import { manageAuthorization } from "../../../modules/authorization/index.js";
import Search from "../../../modules/search/query.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		Promise.resolve(() => {
			const id = c.req.param("id");
			Search.query(id).then((data) => {
				const entry = data.list.at(0);
				if (!id || !entry) {
					return c.html(
						<Base title={`Editting ${id}`}>
							<E404 />
						</Base>
					);
				}

				return c.html(
					<Base title={`Editting: ${id}`}>
						<BaseManageEdit entry={entry} />
					</Base>
				);
			});
		}),
		{
			adminOnly: true,
			redirect: true,
		}
	);
