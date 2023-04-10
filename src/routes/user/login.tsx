import { Context } from "hono";
import { BaseLogin } from "../../components/user/login.js";
import { Base } from "../../components/_base/base.js";

export default (c: Context) =>
	new Promise((res) => {
		res(
			c.html(
				<Base
					title="Login"
					path={c.req.path}>
					<BaseLogin />
				</Base>
			)
		);
	});
