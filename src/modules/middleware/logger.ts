import "colors";
import type { MiddlewareHandler } from "hono";
import Utils from "../utils/index.js";
import CachedPage from "./cacher/index.js";

export const logger = (): MiddlewareHandler => (c, next) =>
	new Promise((res) => {
		if (c.req.header("User-Agent") !== CachedPage.UserAgent) {
			const url = new URL(c.req.url);
			Utils.info(c.req.method.substring(0, 3).blue, `${url.pathname}${url.search}`);
		}

		res(next());
	});
