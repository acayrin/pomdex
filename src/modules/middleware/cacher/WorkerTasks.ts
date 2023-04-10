import async from "async";
import Critters from "critters";
import { existsSync, mkdir, readFile, writeFile } from "fs";
import { Context } from "hono";
import { join } from "path";
import { gunzip, gzip } from "zlib";
import Utils from "../../utils/index.js";
import { AsyncNext } from "./types/AsyncNext.js";

class WorkerTasks {
	static #Critters = new Critters({ logLevel: "silent", inlineFonts: true });

	/**
	 * Task check and create cache directory if not found
	 * @param o options
	 */
	static taskCheckCacheDir(o: { cacheDirPath: string; next: AsyncNext }) {
		if (existsSync(o.cacheDirPath)) {
			o.next(null);
		} else {
			mkdir(o.cacheDirPath, o.next);
		}
	}

	/**
	 * Task read cache file if found, return undefined otherwise
	 * @param o options
	 */
	static taskReadCacheFile(o: { cacheDirPath: string; urlPathname: string; next: AsyncNext }) {
		const path = join(o.cacheDirPath, Utils.hash(o.urlPathname));
		readFile(path, (error, buffer) => {
			if (error) {
				Utils.error("CACHE".yellow, `E1W: ${path}.`, "Possibly first time rendering.", error);
			}

			o.next(null, buffer);
		});
	}

	/**
	 * Task unzip cache file, if cache file is undefined or an error occured,
	 * return original file
	 * @param o options
	 */
	static taskUnzipCacheFile(o: { cacheFile: Buffer | undefined; urlPathname: string; next: AsyncNext }) {
		gunzip(o.cacheFile, { level: 9 }, (error, buffer) => {
			if (error) {
				Utils.error("CACHE".yellow, `E2W: ${o.urlPathname}.`, "Possible first time rendering", error);
			}

			o.next(null, buffer || o.cacheFile);
		});
	}

	/**
	 * Task generate new page content based on given url pathname
	 * @param o options
	 */
	static taskGeneratePageContent(o: {
		data: {
			context: Context;
			pathname: string;
			cachePath: string;
			resolvedMap: Map<string | RegExp, (c: Context) => Promise<Response>>;
		};
		next: AsyncNext;
	}) {
		this.fnGenerateNewContent(o.data)
			.then((newContent) => {
				if (newContent instanceof Response) {
					newContent.text().then((body) => {
						o.next(null, Buffer.from(body));
					});
				} else {
					o.next(null, Buffer.from(newContent));
				}
			})
			.catch((error) => {
				Utils.error("CACHE".yellow, `Failed to generate buffer ${o.data.pathname}`.red, error);

				o.next(error);
			});
	}

	/**
	 * Task parallel both unzip cache and generate new content
	 * @param o options
	 */
	static taskParallelUnzipAndGenerate(o: {
		taskData1: {
			cacheFile: Buffer | undefined;
			urlPathname: string;
		};
		taskData2: {
			context: Context;
			pathname: string;
			cachePath: string;
			resolvedMap: Map<string | RegExp, (c: Context) => Promise<Response>>;
		};
		next: AsyncNext;
	}) {
		async.parallel(
			[
				(next: AsyncNext) => {
					this.taskUnzipCacheFile({
						cacheFile: o.taskData1.cacheFile,
						urlPathname: o.taskData1.urlPathname,
						next,
					});
				},
				(next: AsyncNext) => {
					this.taskGeneratePageContent({
						data: o.taskData2,
						next,
					});
				},
			],
			(error, results: [Buffer | undefined, Buffer]) => {
				o.next(error, results[0], results[1]);
			}
		);
	}

	/**
	 * Task compare cached file content and generately file content based on their hashes
	 * @param o options
	 */
	static taskCompareContent(o: {
		newContent: Buffer;
		cachedContent: Buffer | undefined;
		urlPathname: string;
		cacheDirPath: string;
		ignoreCache: boolean;
		next: AsyncNext;
	}) {
		if (o.ignoreCache || Utils.hash(o.cachedContent || "") !== Utils.hash(o.newContent || "")) {
			gzip(o.newContent, { level: 9 }, (error, result) => {
				if (error) {
					Utils.error("CACHE".yellow, `E3W: ${o.urlPathname}.`, "Failed to compress.", error);

					o.next(error);
				} else {
					writeFile(join(o.cacheDirPath, Utils.hash(o.urlPathname)), result, (error) => {
						// Release
						result = null;

						if (error) {
							Utils.error("CACHE".yellow, `E3W: ${o.urlPathname}.`, "Failed to write cache file.", error);

							o.next(null);
						} else {
							o.next(null, {
								message: `Cache updated for ${o.urlPathname}`,
								status: 2,
							});
						}
					});
				}
			});
		} else {
			o.next(null, {
				message: `Cache unchanged for ${o.urlPathname}`,
				status: 3,
			});
		}
	}

	/**
	 * Generate new response body based on given pathname
	 * @param o options
	 * @returns Response body as string
	 */
	static fnGenerateNewContent = (o: {
		context: Context;
		pathname: string;
		cachePath: string;
		resolvedMap: Map<string | RegExp, (c: Context) => Promise<Response>>;
	}): Promise<string | Response> =>
		new Promise((resolve, reject) =>
			// prettier-ignore
			Array.from(o.resolvedMap.entries())
				.sort((a, b) => b[0].toString().length - a[0].toString().length)
				.find(([reg]) => (typeof reg !== "string" && reg.test(o.pathname)) || reg === o.pathname)
				?.[1](o.context)
				?.then((response) => {
					response.text()?.then((newContent) => {
						if (newContent.length === 0) {
							return resolve(response);
						}

						try {
							JSON.parse(newContent);

							resolve(newContent);
						} catch {
							this.#Critters.process(newContent).then(resolve).catch(reject);
						}
					});
				})
				?.catch(reject)
		);
}

export { WorkerTasks };
