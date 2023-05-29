import { Context } from "hono";
import { BaseRegister } from "../../components/user/register.js";
import { Base } from "../../layouts/base/base.js";;

export default (c: Context) =>
	Promise.resolve(
		c.html(
			<Base
				title="Register"
				path={c.req.path}>
				<BaseRegister />
			</Base>
		)
	);
