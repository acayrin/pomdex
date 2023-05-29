import { Context } from "hono";
import { BaseMontlyDyeTable } from "../../components/others/mdt/base.js";
import { Base } from "../../layouts/base/base.js";

export default (c: Context) =>
	new Promise((res, rej) => {
		BaseMontlyDyeTable()
			.then((children) => {
				res(
					c.html(
						<Base
							title="Monthly Dye Table"
							path={c.req.path}>
							{children}
						</Base>
					)
				);
			})
			.catch(rej);
	});
