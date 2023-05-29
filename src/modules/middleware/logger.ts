import "colors";
import type { MiddlewareHandler } from "hono";
import { CachedPage } from "./cacher/index.js";
import { App } from "../app.js";

export const logger = (): MiddlewareHandler => (c, next) =>
	new Promise((res) => {
		if (c.req.header("User-Agent") !== CachedPage.UserAgent) {
			const url = new URL(c.req.url);
			App.info(c.req.method.substring(0, 3).blue, `${url.pathname}${url.search}`);
		}

		res(next());
	});
