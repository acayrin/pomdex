import { serve } from "@hono/node-server";
import "colors";
import fastq from "fastq";
import { readdirSync, statSync } from "fs";
import { Context, Env, Hono, Next } from "hono";
import ky from "ky";
import { totalmem } from "os";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import Utils from "../modules/utils/index.js";
import { PomdexCollection } from "./database/init.js";
import { UserAgent } from "./middleware/cachedPage.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const RenderedPages = new Map<string, string>();

export class App extends Hono {
	static readonly MaxConcurrency =
		Number(process.env.MAX_CONCURRENCY) || Math.round(totalmem() / (1024 * 1024 * 255));

	readonly froutes = new Map<string, (c: Context) => Promise<Response>>();
	#runTaskBefore: Function[] = [];
	#runTaskAfter: Function[] = [];

	readonly appOptions: {
		port?: string | number;
	};

	constructor(opts?: {
		honoOptions?: Partial<Pick<Hono<Env, {}, "">, "router" | "strict">>;
		appOptions?: {
			port?: string | number;
		};
	}) {
		super(opts.honoOptions);

		if (opts?.appOptions) {
			this.appOptions = opts.appOptions;
		}
	}

	async serve() {
		// Wait for all tasks to complete
		Utils.info("Waiting for all tasks to complete...".yellow);
		for (const task of this.#runTaskBefore) await task(this);

		// Load routes
		this.#loadRoutes();
		this.notFound((c) => c.redirect("/404"));

		// Start server
		serve({
			fetch: this.fetch,
			port: Number(this.appOptions?.port) || 8080,
		});

		// Finishing up
		Utils.info("Server started on port".green, (this.appOptions?.port?.toString() || "8080").blue);

		// Running after tasks
		Utils.info("Running post tasks...".yellow);
		Promise.all(this.#runTaskAfter.map((task) => task(this)));
	}

	#loadRoutes() {
		recursiveLookup(join(__dirname, "../routes/"), async (file) => {
			let path = file
				.replace(join(__dirname, "../routes/"), "")
				.replace(/(\.tsx)|(\.ts)|(\.js)/gi, "")
				.replace(/\$/gi, ":")
				.replace(/(index)|(_)/gi, "")
				.replace(/\\/gi, "/");
			if (path.length > 1 && path.endsWith("/")) path = path.slice(0, path.length - 1);

			let reqType = "all";
			for (const type of ["get", "head", "post", "put", "delete", "trace", "connect"]) {
				if (basename(file).toLowerCase().startsWith(`${type}~`)) {
					reqType = type;
					path = path.replace(new RegExp(`${type}~`, "gi"), "");
				}
			}

			if (process.platform === "win32") file = `file://${file}`;

			this.froutes.set(path, (await import(file)).default);
			this[reqType](path, (await import(file)).default);

			Utils.info("Route", reqType.toUpperCase().yellow, path.cyan, "->", file.cyan);
		});
	}

	runTaskAfter(...tasks: Function[]) {
		this.#runTaskAfter = this.#runTaskAfter.concat(tasks);

		return this;
	}
	runTaskBefore(...tasks: Function[]) {
		this.#runTaskBefore = this.#runTaskBefore.concat(tasks);

		return this;
	}

	useWithApp(path: string, func: (c: Context, n: Next, app: App) => Promise<Response | void>) {
		this.use(path, (ctx, nxt) => func(ctx, nxt, this));
	}
}

const recursiveLookup = (path: string, callback: (path: string) => unknown) =>
	readdirSync(path).map((name) => {
		if (statSync(`${path}/${name}`).isDirectory()) {
			recursiveLookup(`${path}/${name}`, callback);
		} else {
			callback(`${path}/${name}`);
		}
	});

export const rebuildCache = async () => {
	PomdexCollection.find()
		.toArray()
		.then(async (list) => {
			const c = (id: string) => {
				return ky.head(`http://127.0.0.1:${process.env.PORT || 8080}/details/${id}/lazy`, {
					headers: {
						"User-Agent": UserAgent,
						"Rebuild-Cache": "1",
					},
					timeout: 30e3,
					retry: {
						backoffLimit: 1e3,
						limit: 10,
					},
				});
			};
			const q = fastq.promise(c, App.MaxConcurrency / 2);
			list.map(async (entry) => await q.push(entry.id));
		});
};
