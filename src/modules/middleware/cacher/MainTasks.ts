import { readFile, stat } from "fs";
import { Context } from "hono";
import { join } from "path";
import { brotliCompress, deflate, gunzip, gzip } from "zlib";
import Utils from "../../utils/index.js";
import { AcceptEncoding } from "./types/AcceptEncoding.js";
import { AsyncNext } from "./types/AsyncNext.js";
import { WorkerTasks } from "./WorkerTasks.js";

class MainTasks {
	/**
	 * Task get accepted encoding type
	 * @param o options
	 */
	static taskGetEncoding(o: { context: Context; next: AsyncNext }) {
		const { context, next } = o;

		const acceptEncodingHeader = context.req.headers.get("Accept-Encoding");
		let encodingType: AcceptEncoding;

		if (acceptEncodingHeader) {
			if (acceptEncodingHeader.match(new RegExp(/gzip/gi))) {
				encodingType = "gzip";
			}
			if (acceptEncodingHeader.match(new RegExp(/br/gi))) {
				encodingType = "br";
			}
			if (acceptEncodingHeader.match(new RegExp(/deflate/gi))) {
				encodingType = "deflate";
			}
		}

		next(null, encodingType);
	}

	/**
	 * Task get cached content of url pathname if exists
	 * @param o options
	 */
	static taskGetCachedContent(o: {
		// from main
		urlPathname: string;
		cacheDirPath: string;
		ignoredCaching: boolean;
		// from waterfall
		acceptEncoding: AcceptEncoding;
		next: AsyncNext;
	}) {
		const { urlPathname, acceptEncoding, cacheDirPath, next } = o;

		// ignore reading file if request is included in ignored caching rules
		if (o.ignoredCaching) {
			return next(null, undefined, acceptEncoding);
		}

		readFile(join(cacheDirPath, Utils.hash(urlPathname)), (error, file) => {
			if (error) {
				Utils.warn("CACHE".yellow, `E1: ${urlPathname}`, "Possibly first time rendering.", error);
			}

			next(null, file, acceptEncoding);
		});
	}

	/**
	 * Task generate new response body if cached file not found
	 * @param o options
	 */
	static taskGenNewIfNotCached(o: {
		// from main
		context: Context;
		urlPathname: string;
		cacheDirPath: string;
		resolveRules: Map<string | RegExp, (c: Context) => Promise<Response>>;
		// from waterfall
		cachedContent: Buffer;
		acceptEncoding: AcceptEncoding;
		next: AsyncNext;
	}) {
		const { context, urlPathname, cacheDirPath, cachedContent, acceptEncoding, resolveRules, next } = o;

		// return the cached content and accepted encoding
		if (cachedContent) {
			return next(null, cachedContent, acceptEncoding, undefined);
		}

		// else generate new content from matching route
		WorkerTasks.fnGenerateNewContent({
			context,
			pathname: urlPathname,
			cachePath: cacheDirPath,
			resolvedMap: resolveRules,
		})
			.then((bodyOrResponse) => {
				if (typeof bodyOrResponse === "string") {
					// return newly generate content body with the accepted encoding
					next(null, Buffer.from(bodyOrResponse), acceptEncoding, undefined);
				} else {
					// else return the raw response from the component
					next(null, undefined, undefined, bodyOrResponse);
				}
			})
			.catch((error) => {
				Utils.error("CACHE".yellow, `E2: ${o.urlPathname}`, error);

				next(error);
			});
	}

	/**
	 * Task unzip cached content if found and return its content type (JSON or Text plain)
	 * @param o options
	 */
	static taskUnzipCachedContent(o: {
		// from main
		context: Context;
		// from waterfall
		cachedContent: Buffer;
		acceptEncoding: AcceptEncoding;
		responseOverride: Response;
		next: AsyncNext;
	}) {
		let { context, cachedContent, acceptEncoding, responseOverride, next } = o;

		// ignore if response is overidden earlier
		if (responseOverride) {
			return next(null, undefined, undefined, undefined, responseOverride);
		}

		gunzip(cachedContent, { level: 9 }, (_, buffer) => {
			// if (error) {
			// 	Utils.error("CACHE".yellow, `E3: ${context.req.path}.`, "Possible first time rendering.", error);
			// }

			// If unable to decompress due to cache not found, use new content instead
			let contentType: "html" | "json";
			try {
				// Response as JSON
				context.res = context.json(JSON.parse((buffer || cachedContent).toString()));
				contentType = "json";
			} catch {
				// Response as HTML
				context.res.headers.append("Content-Type", "text/html");
				contentType = "html";
			}

			next(null, buffer || cachedContent, acceptEncoding, contentType, undefined);
		});
	}

	/**
	 * Task compress response body to corresponding accepted encoding
	 * @param o options
	 */
	static taskCompressResponseBody(o: {
		// from main
		context: Context;
		// from waterfall
		body: Buffer;
		contentType: "json" | "html";
		acceptEncoding: AcceptEncoding;
		responseOverride: Response;
		next: AsyncNext;
	}) {
		let { body, contentType, context, acceptEncoding, responseOverride, next } = o;

		// ignore if response is overidden earlier
		if (responseOverride) {
			return next(null, responseOverride);
		}

		// ignore compression if response body is json type
		if (contentType === "json") {
			return next(null, o.context.json(body.toString()));
		}

		// compress if allowed
		for (const compress of ["gzip", "brotli", "deflate"]) {
			if (compress === acceptEncoding) {
				this.#compression[compress](body, (error: Error, buffer: Buffer) => {
					if (error) {
						Utils.error("CACHE".yellow, `E4: ${acceptEncoding}.`, "Failed to compress.", error);
					} else {
						context.res.headers.append("Content-Encoding", compress);
					}

					context.res = new Response(buffer || body, Object.assign({ status: 200 }, context.res));

					next(null, context.res);
				});

				return;
			}
		}

		// raw response if no compression allowed
		context.res = context.html(body.toString());

		next(null, context.res);
	}

	/**
	 * Task finalize response
	 * @param o options
	 */
	static taskFinalizeResponse(o: { response: Response; urlPathname: string; cacheDirPath: string; next: AsyncNext }) {
		const { response, urlPathname, cacheDirPath, next } = o;

		stat(join(cacheDirPath, Utils.hash(urlPathname)), (error, stats) => {
			response.headers.append("Last-Modified", new Date(error ? Date.now() : stats.mtimeMs).toUTCString());

			next(null, response);
		});
	}

	static #compression = {
		gzip,
		brotli: brotliCompress,
		deflate,
	};
}

export { MainTasks as Tasks };
