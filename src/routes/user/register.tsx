import { Context } from "hono";
import { BaseRegister } from "../../components/user/register.js";
import { Base } from "../../components/_base/base.js";

export default async (c: Context) =>
	c.html(
		<Base title="Register">
			<BaseRegister />
		</Base>
	);
