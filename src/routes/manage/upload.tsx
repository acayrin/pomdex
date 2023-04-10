import { Context } from "hono";
import { BaseManageUpload } from "../../components/manage/upload.js";
import { Base } from "../../components/_base/base.js";
import { manageAuthorization } from "../../modules/authorization/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		new Promise((res) =>
			res(
				c.html(
					<Base title={`Editting: New Entry`}>
						<BaseManageUpload />
					</Base>
				)
			)
		),
		{
			adminOnly: true,
			redirect: true,
		}
	);
