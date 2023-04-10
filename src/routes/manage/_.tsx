import { Context } from "hono";
import { BaseManageList } from "../../components/manage/explorer.js";
import { Base } from "../../components/_base/base.js";
import { manageAuthorization } from "../../modules/authorization/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) => {
			res(
				c.html(
					<Base title="Manage">
						<BaseManageList />
					</Base>
				)
			);
		}),
		{
			adminOnly: true,
			redirect: true
		}
	);
