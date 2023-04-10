import { Context } from "hono";
import { BaseManageNew } from "../../components/manage/new.js";
import { Base } from "../../components/_base/base.js";
import { manageAuthorization } from "../../modules/authorization/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) =>
			res(
				c.html(
					<Base title={`Editting: New Entry`}>
						<BaseManageNew />
					</Base>
				)
			)
		),
		{
			adminOnly: true,
			redirect: true,
		}
	);
