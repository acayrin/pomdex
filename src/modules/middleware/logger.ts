import "colors";
import type { MiddlewareHandler } from "hono";
import Utils from "../utils/index.js";
import { UserAgent } from "./cachedPage.js";

export const logger = (): MiddlewareHandler => async (c, next) => {
	if (c.req.header("User-Agent") !== UserAgent) {
		const url = new URL(c.req.url);
		Utils.info(c.req.method.substring(0, 3).blue, `${url.pathname}${url.search}`);
	}

	await next();
};
