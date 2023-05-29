import async from "async";
import { Context } from "hono";
import { PomdexAccounts } from "../database/index.js";

const respond = (c: Context, redirect = false) =>
	redirect
		? c.redirect("/user/login")
		: c.json(
				{
					status: 403,
					message: "Access denied",
				},
				403
		  );

const taskGetAccountType = (c: Context, next: (error: Error, ...args: unknown[]) => void) => {
	PomdexAccounts.findOne({
		token: c.req.cookie("pomdexAccount"),
	})
		.then((account) => next(null, account.type === "admin" ? 2 : 1))
		.catch(next);
};

const taskGetRouteReponse = (c: Context, fn: Promise<unknown>, next: (error: Error, ...args: unknown[]) => void) => {
	// Do work here
	fn.then((data) => next(null, data)).catch((error) =>
		next(
			null,
			c.json(
				{
					status: 500,
					message: "Internal server error",
					error,
				},
				500
			)
		)
	);
};

const manageAuthorization = (c: Context, fn: Promise<unknown>, o?: { adminOnly?: boolean; redirect?: boolean }) =>
	new Promise((resolve, reject) => {
		if (c.req.cookie("pomdexAccount")) {
			async.parallel(
				[
					(next: (error: Error, ...args: unknown[]) => void) => taskGetAccountType(c, next),
					(next: (error: Error, ...args: unknown[]) => void) => taskGetRouteReponse(c, fn, next),
				],
				(error, responses: Response[]) => {
					if (error) {
						reject(error);
					} else if (Number(responses[0]) === 2) {
						resolve(responses[1]);
					} else if (Number(responses[0]) === 1) {
						resolve(o.adminOnly ? respond(c, o.redirect) : responses[1]);
					} else {
						resolve(respond(c, o.redirect));
					}
				}
			);
		} else {
			resolve(respond(c, o.redirect));
		}
	});

export { manageAuthorization };
