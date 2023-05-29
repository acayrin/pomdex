import { Context } from "hono";
import { BaseManageList } from "../../components/manage/explorer.js";
import { Base } from "../../layouts/base/base.js";
import { manageAuthorization } from "../../modules/authorization/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		Promise.resolve(
			c.html(
				<Base title="Manage">
					<BaseManageList />
				</Base>
			)
		),
		{
			adminOnly: true,
			redirect: true,
		}
	);
