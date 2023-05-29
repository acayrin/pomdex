import { Context } from "hono";
import { E404 } from "../components/errors/404.js";
import { Base } from "../layouts/base/base.js";;

export default (c: Context) =>
	Promise.resolve(
		c.html(
			<Base title="404">
				<E404 />
			</Base>
		)
	);
