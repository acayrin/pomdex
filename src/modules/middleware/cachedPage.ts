import "colors";
import Critters from "critters";
import { createHash } from "crypto";
import fastq from "fastq";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import type { Context, Next } from "hono";
import { dirname, join } from "path";
import { compressSync, uncompressSync } from "snappy";
import { fileURLToPath } from "url";
import { App } from "../app.js";
import Utils from "../utils/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * A private method that is used to validate the checksum of the cached page.
 *
 * @async
 */
const checkCachedPage = async (o: {
	context: Context;
	pathname: string;
	cachePath: string;
	resolvedMap: Map<string | RegExp, (c: Context) => Promise<Response>>;
	compressionLevel: number;
	ignoreCache: boolean;
}) => {
	// Fetch current cached page
	let cachedContentHash = null;
	try {
		cachedContentHash = uncompressSync(readFileSync(join(o.cachePath, hash(o.pathname))))
			.toString()
			.slice(24, 56);
	} catch (e) {
		// page not cached
	}

	// Load the related route component
	let newContent = "";
	for (const [reg, func] of Array.from(o.resolvedMap.entries()).sort(
		(a, b) => b[0].toString().length - a[0].toString().length
	)) {
		if (typeof reg !== "string") {
			if (reg.test(o.pathname)) {
				newContent = await (await func(o.context)).text();
				break;
			}
		} else if (reg === o.pathname) {
			newContent = await new Critters({ logLevel: "silent", inlineFonts: true }).process(
				await (await func(o.context)).text()
			);
			break;
		}
	}

	if (cachedContentHash === hash(newContent) && !o.ignoreCache)
		// Verify checksum
		return;

	if (!existsSync(o.cachePath)) {
		// Create dir if not found
		mkdirSync(o.cachePath);
	}

	// Write content of the page into a cache file
	writeFileSync(
		join(o.cachePath, hash(o.pathname)),
		compressSync(
			[
				// modified date
				JSON.stringify(new Date()).replace(/"/g, ""),
				// content checksum
				hash(newContent),
				// page content
				newContent,
			].join("")
		)
	);

	return {
		message: [hash(o.pathname).slice(0, 8), o.pathname].join(" "),
		status: 2,
	};
};

let queue: fastq.queueAsPromised<
	{
		context: Context<any, any, {}>;
		pathname: string;
		cachePath: string;
		resolvedMap: Map<string | RegExp, (c: Context<any, any, {}>) => Promise<Response>>;
		compressionLevel: number;
		ignoreCache: boolean;
	},
	{ message: string; status: number }
>;
const resolvedRoutes = new Map<string | RegExp, (c: Context) => Promise<Response>>();
const ignoreRules: RegExp[] = [];
let compressionLevel = 3;
let redirectRules: Map<RegExp, string> = new Map();
let cachePath = join(__dirname, "../../../.prebuilt");

export const UserAgent = "Hono - CachedPage";
export const CachedPage = (o?: {
	cachePath?: string;
	ignoreRules?: RegExp[];
	redirectRules?: Map<RegExp, string>;
	compressionLevel?: number;
}): ((c: Context, next: Next, app: App) => Promise<Response | void>) => {
	queue = fastq.promise(checkCachedPage, App.MaxConcurrency);
	cachePath = o?.cachePath ? o.cachePath : cachePath;

	if (o?.ignoreRules) ignoreRules.push(...o.ignoreRules);
	if (o?.redirectRules) redirectRules = o.redirectRules;
	if (o?.compressionLevel) compressionLevel = o.compressionLevel;

	/**
	 * Return the middleware callback for Hono use
	 *
	 * @async
	 * @param {Context} c
	 * @param {Next} next
	 * @param {App} app
	 */
	return async (c: Context, next: Next, app: App) => {
		if (setupResolveRules) {
			setupResolveRules(app);

			setupResolveRules = undefined;
		}

		// Url path
		let path = new URL(c.req.url).pathname;

		// Apply redirect rule(s)
		for (const [regex, replace] of redirectRules.entries()) if (new RegExp(regex).test(path)) path = replace;

		if (ignoreRules.some((r) => new RegExp(r).test(path))) {
			return await next();
		}

		// Check for (re)building cache
		// Add path to preload queue
		if (c.req.header("User-Agent") === UserAgent && c.req.header("Rebuild-Cache")) {
			pushCheckCache(c, path, true);

			return c.text("REBUILD");
		}

		// Ignore configured ignored paths and path missing cache
		if (!isCached(path)) {
			pushCheckCache(c, path);

			return await next();
		}

		// Validate cache content
		setTimeout(() => {
			pushCheckCache(c, path);
		}, 1e3);

		// Decompress cache
		const decompressed = uncompressSync(readFileSync(join(cachePath, hash(path)))).toString();

		// Last modified header
		c.res.headers.append("Last-Modified", new Date(decompressed.slice(0, 24)).toUTCString());

		// Send page to user
		return c.html(decompressed.slice(56));
	};
};

/**
 * A one-time function that is being called in the middleware to set up resolved routes
 *
 * @name setupResolveRules
 * @param {App} app
 * @returns {void}
 */
let setupResolveRules = (app: App): void => {
	if (Array.from(app.froutes.keys()).length > 0 && Array.from(resolvedRoutes).length === 0) {
		for (const path of app.froutes.keys()) {
			const matchWithoutParams = !path.includes(":");
			if (matchWithoutParams) {
				resolvedRoutes.set(path.length === 0 ? "/" : path, app.froutes.get(path));
			}

			const matchWithParams = `${path}/`.match(new RegExp(/:[^\/]*(?=\/)/gi))?.at(0);
			if (matchWithParams) {
				resolvedRoutes.set(new RegExp(path.replace(matchWithParams, ".+")), app.froutes.get(path));
			}
		}
		Utils.info("CachedPage".magenta, "Loaded route mappings");
	}
};

/**
 * A method that returns a md5 hashed string
 *
 * @name hash
 * @static
 * @param {string} path
 * @returns {string}
 */
const hash = (path: string): string => createHash("md5").update(path).digest("hex");

/**
 * Checking if the path is cached.
 *
 * @name isCached
 * @param {string} path
 * @returns {boolean}
 */
const isCached = (path: string): boolean => {
	for (const [regex, replace] of redirectRules.entries()) if (new RegExp(regex).test(path)) path = replace;

	return (
		// Ignored paths
		!ignoreRules.some((r) => new RegExp(r).test(path)) &&
		// File cache exist or not
		existsSync(join(cachePath, hash(path)))
	);
};

/**
 * A function that is being called in the middleware.
 *
 * @name pushCheckCache
 * @param {Context} context
 * @param {string} pathname
 * @param {boolean} ignoreCache?
 * @returns {void}
 */
const pushCheckCache = (context: Context, pathname: string, ignoreCache: boolean = false): void => {
	queue
		.push({
			context,
			pathname,
			cachePath,
			resolvedMap: resolvedRoutes,
			compressionLevel,
			ignoreCache,
		})
		.then((recieved: any) => {
			switch (recieved?.status) {
				case 1:
					Utils.info("CACHE".green, recieved.message);
					break;
				case 2:
					Utils.info("CACHE".yellow, recieved.message);
					break;
				case 3:
					Utils.error("CACHE".red, recieved.message);
					break;
			}
		})
		.catch((err) => console.error(err));
};
