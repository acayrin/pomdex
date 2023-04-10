import { Context } from "hono";
import { BaseRegister } from "../../components/user/register.js";
import { Base } from "../../components/_base/base.js";

export default (c: Context) =>
	new Promise((res) => {
		res(
			c.html(
				<Base
					title="Register"
					path={c.req.path}>
					<BaseRegister />
				</Base>
			)
		);
	});
