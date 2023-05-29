import { Context } from "hono";
import { BaseManageNew } from "../../components/manage/new.js";
import { Base } from "../../layouts/base/base.js";
import { manageAuthorization } from "../../modules/authorization/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		Promise.resolve(
			c.html(
				<Base title={"Editting: New Entry"}>
					<BaseManageNew />
				</Base>
			)
		),
		{
			adminOnly: true,
			redirect: true,
		}
	);
