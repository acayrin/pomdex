import { Context } from "hono";
import { BaseManageUpload } from "../../components/manage/upload.js";
import { Base } from "../../layouts/base/base.js";
import { manageAuthorization } from "../../modules/authorization/index.js";

export default (c: Context) =>
	manageAuthorization(
		c,
		Promise.resolve(
			c.html(
				<Base title={"Editting: New Entry"}>
					<BaseManageUpload />
				</Base>
			)
		),
		{
			adminOnly: true,
			redirect: true,
		}
	);
