import async from "async";
import "colors";
import type { Context, Next } from "hono";
import { App } from "../../app.js";
import Utils from "../../utils/index.js";
import { Tasks } from "./MainTasks.js";
import { AcceptEncoding } from "./types/AcceptEncoding.js";
import { AsyncNext } from "./types/AsyncNext.js";
import { WorkerTasks } from "./WorkerTasks.js";

export default class CachedPage {
	static readonly UserAgent = "Hono - CachedPage";

	constructor(
		app: App,
		o?: {
			cachePath?: string;
			ignoreAll?: RegExp[];
			ignoreCaching?: RegExp[];
			ignoreCompress?: RegExp[];
			redirectRules?: Map<RegExp, string>;
			logLevel?: "none" | "change" | "all";
		}
	) {
		if (o?.logLevel) this.#cacheLogLevel = o.logLevel;
		if (o?.cachePath) this.#cachePath = o.cachePath;
		if (o?.ignoreAll) this.#cacheIgnoreAll.push(...o.ignoreAll);
		if (o?.ignoreCaching) this.#cacheIgnoreCaching.push(...o.ignoreCaching);
		if (o?.ignoreCompress) this.#cacheIgnoreCompress.push(...o.ignoreCompress);
		if (o?.redirectRules) this.#cacheRedirectRules = o.redirectRules;
	}

	#cacheLogLevel: "none" | "change" | "all" = "change";
	#cachePath = "./.prebuilt";
	#cacheRedirectRules: Map<RegExp, string> = new Map();
	#cacheResolveRules = new Map<string | RegExp, (c: Context) => Promise<Response>>();

	#cacheIgnoreAll: RegExp[] = [];
	#cacheIgnoreCaching: RegExp[] = [];
	#cacheIgnoreCompress: RegExp[] = [];

	#cacheWorkerQueue: async.QueueObject<{
		context: Context<any, any, {}>;
		pathname: string;
		cachePath: string;
		resolvedMap: Map<string | RegExp, (c: Context<any, any, {}>) => Promise<Response>>;
		ignoreCache: boolean;
	}> = async.queue((o, next) => {
		this.#workerTasksCheckTask(o)
			.then((recieved) => {
				switch (this.#cacheLogLevel) {
					case "all": {
						switch (recieved?.status) {
							case 1:
								Utils.info("CACHE".green, recieved.message);
								break;
							case 2:
								Utils.info("CACHE".yellow, recieved.message);
								break;
							case 3:
								Utils.info("CACHE".green, recieved.message);
								break;
						}
						break;
					}
					case "change": {
						if (recieved.status === 2) {
							Utils.info("CACHE".yellow, recieved.message);
						}
						break;
					}
				}

				next(null);
			})
			.catch((error) => {
				Utils.error(error);

				next(error);
			});
	}, App.MaxConcurrency);

	// [ Bind as Hono middleware] =======================================================================
	bind = (context: Context, Next: Next, app: App): Promise<void | Response> =>
		new Promise((resolve, reject) => {
			// One-time setup resolve rules
			if (this.#taskSetupResolveRulesOnce) {
				this.#taskSetupResolveRulesOnce(app);
				this.#taskSetupResolveRulesOnce = null;
			}

			// Url path
			let path = new URL(context.req.url).pathname;

			// Apply redirect rule(s)
			for (const [regex, replace] of this.#cacheRedirectRules.entries())
				if (new RegExp(regex).test(path)) path = replace;

			// Check for (re)building cache
			// Add path to preload queue
			if (context.req.header("User-Agent") === CachedPage.UserAgent && context.req.header("Rebuild-Cache")) {
				this.#workerTasksPush(context, path, true);

				return resolve(context.text("OK"));
			}

			// Ignore everything, just proceed to matching routes
			if (this.#cacheIgnoreAll.some((r) => new RegExp(r).test(path))) {
				return resolve(Next());
			}

			// Ignore compression, push check task and proceed to matching routes
			if (this.#cacheIgnoreCompress.some((r) => new RegExp(r).test(path))) {
				this.#workerTasksPush(context, path);

				return resolve(Next());
			}

			async.waterfall(
				[
					// [ Get encoding ]
					(next: (err: Error, ...args: any) => void) => {
						Tasks.taskGetEncoding({
							context,
							next,
						});
					},

					// [ Get cached content if any ]
					(acceptEncoding: AcceptEncoding, next: (err: Error, ...args: any) => void) => {
						Tasks.taskGetCachedContent({
							urlPathname: path,
							cacheDirPath: this.#cachePath,
							ignoredCaching: this.#cacheIgnoreCaching.some((r) => new RegExp(r).test(path)),
							// waterfall
							acceptEncoding,
							next,
						});
					},

					// [ Generate new resposne body if cache not found ]
					(
						cachedContent: Buffer,
						acceptEncoding: AcceptEncoding,
						next: (err: Error, ...args: any) => void
					) => {
						Tasks.taskGenNewIfNotCached({
							context,
							urlPathname: path,
							cacheDirPath: this.#cachePath,
							resolveRules: this.#cacheResolveRules,
							// waterfall
							cachedContent,
							acceptEncoding,
							next,
						});
					},

					// [ Unzip cached content ]
					(
						cachedContent: Buffer,
						acceptEncoding: AcceptEncoding,
						responseOverride: Response,
						next: (err: Error, ...args: any) => void
					) => {
						Tasks.taskUnzipCachedContent({
							context,
							// waterfall
							cachedContent,
							acceptEncoding,
							responseOverride,
							next,
						});
					},

					// [ Compress response body ]
					(
						body: Buffer,
						acceptEncoding: AcceptEncoding,
						contentType: "html" | "json",
						responseOverride: Response,
						next: (err: Error, ...args: any) => void
					) => {
						Tasks.taskCompressResponseBody({
							body,
							context,
							contentType,
							acceptEncoding,
							responseOverride,
							next,
						});
					},

					// [ Finalize response ]
					(response: Response, next: (err: Error, ...args: any) => void) => {
						Tasks.taskFinalizeResponse({
							response,
							urlPathname: path,
							cacheDirPath: this.#cachePath,
							next,
						});
					},
				],

				// Resolve or reject response
				(error, response: Response) => {
					if (error) {
						reject(error);
					} else {
						resolve(response);

						// Only push cache task if not ignored by rules
						if (!this.#cacheIgnoreCaching.some((r) => new RegExp(r).test(path))) {
							// Push check cached content task
							this.#workerTasksPush(context, path);
						}
					}
				}
			);
		});

	// [ One time setup redirect rules ] ===========================================================
	#taskSetupResolveRulesOnce = (app: App) => {
		if (Array.from(app.froutes.keys()).length > 0 && Array.from(this.#cacheResolveRules).length === 0) {
			for (const path of app.froutes.keys()) {
				const matchWithoutParams = !path.includes(":");
				if (matchWithoutParams) {
					this.#cacheResolveRules.set(path.length === 0 ? "/" : path, app.froutes.get(path));
				}

				const matchWithParams = `${path}/`.match(new RegExp(/:[^\/]*(?=\/)/gi))?.at(0);
				if (matchWithParams) {
					this.#cacheResolveRules.set(new RegExp(path.replace(matchWithParams, ".+")), app.froutes.get(path));
				}
			}
		}
	};

	// [ Push new task to work queue ] ================================================================
	#workerTasksPush = (context: Context, pathname: string, ignoreCache: boolean = false) =>
		this.#cacheWorkerQueue.push({
			context,
			pathname,
			cachePath: this.#cachePath,
			resolvedMap: this.#cacheResolveRules,
			ignoreCache,
		});

	// [ Check for page content and update if needed ] =================================================
	#workerTasksCheckTask = (o: {
		context: Context;
		pathname: string;
		cachePath: string;
		resolvedMap: Map<string | RegExp, (c: Context) => Promise<Response>>;
		ignoreCache: boolean;
	}): Promise<{ message: string; status: 1 | 2 | 3 }> =>
		new Promise((res, rej) =>
			async.waterfall(
				[
					// Create dir if not found
					(next: AsyncNext) => {
						WorkerTasks.taskCheckCacheDir({
							cacheDirPath: o.cachePath,
							next,
						});
					},
					// Check if file exists
					(next: AsyncNext) => {
						WorkerTasks.taskReadCacheFile({
							cacheDirPath: o.cachePath,
							urlPathname: o.pathname,
							next,
						});
					},
					// + Unzip cached file content
					// + Generate new page content
					(cacheFile: Buffer | undefined, next: AsyncNext) => {
						WorkerTasks.taskParallelUnzipAndGenerate({
							taskData1: {
								cacheFile,
								urlPathname: o.pathname,
							},
							taskData2: o,
							next,
						});
					},
					// Compare cached and new page content
					(cachedContent: Buffer | undefined, newContent: Buffer, next: AsyncNext) => {
						WorkerTasks.taskCompareContent({
							cacheDirPath: o.cachePath,
							ignoreCache: o.ignoreCache,
							urlPathname: o.pathname,
							newContent,
							cachedContent,
							next,
						});
					},
				],
				// Resolve or reject promise
				(error, response: { message: string; status: 1 | 2 | 3 }) => {
					if (error) {
						rej(error);
					} else {
						res(response);
					}
				}
			)
		);
}
