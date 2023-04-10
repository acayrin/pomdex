import { Context } from "hono";
import { E404 } from "../components/errors/404.js";
import { Base } from "../components/_base/base.js";

export default (c: Context) =>
	new Promise((res) => {
		res(
			c.html(
				<Base title="404">
					<E404 />
				</Base>
			)
		);
	});
