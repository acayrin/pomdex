import { Context } from "hono";
import { BaseLogin } from "../../components/user/login.js";
import { Base } from "../../components/_base/base.js";

export default async (c: Context) =>
	c.html(
		<Base
			title="Login">
			<BaseLogin />
		</Base>
	);
