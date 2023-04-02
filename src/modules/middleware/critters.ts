import Critters from "critters";
import { Context, MiddlewareHandler, Next } from "hono";

export const critters = (): MiddlewareHandler => async (c: Context, n: Next) => {
	await n();
    
	const body = await c.res.text();

	try {
		JSON.parse(body);
		c.res = new Response(body, c.res);
	} catch (_) {
		const z = await new Critters({
			logLevel: "silent",
		}).process(body);
		c.res = new Response(z, c.res);
	}
};
