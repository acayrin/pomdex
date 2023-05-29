import { Context } from "hono";
import { BaseLogin } from "../../components/user/login.js";
import { Base } from "../../layouts/base/base.js";

export default (c: Context) =>
	Promise.resolve(
		c.html(
			<Base
				title="Login"
				path={c.req.path}>
				<BaseLogin />
			</Base>
		)
	);
