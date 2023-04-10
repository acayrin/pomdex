import { serve } from "@hono/node-server";
import async from "async";
import "colors";
import { Context, Env, Hono, Next } from "hono";
import ky from "ky";
import { cpus } from "os";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import Utils from "../modules/utils/index.js";
import { PomdexCollection } from "./database/index.js";
import CachedPage from "./middleware/cacher/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

class App extends Hono {
	static readonly MaxConcurrency = Number(process.env.MAX_CONCURRENCY) || cpus().length - 1;

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

	// [ Start server on PORT ] ========================================================================
	async serve() {
		Utils.info(`Starting with max concurrency tasks: ${App.MaxConcurrency}`.green);

		// Wait for all tasks to complete
		Utils.info("Waiting for all tasks to complete...".yellow);
		for (const task of this.#runTaskBefore) await task(this);

		// Load routes
		await this.#loadRoutes();
		this.notFound((c) => c.redirect("/404", 301));

		// Start server
		serve({
			fetch: this.fetch,
			port: Number(this.appOptions?.port) || Number(process.env.PORT) || 8080,
		});

		// Finishing up
		Utils.info("Server started on port".green, (this.appOptions?.port?.toString() || "8080").blue);

		// Running after tasks
		Utils.info("Running post tasks...".yellow);
		Promise.all(this.#runTaskAfter.map((task) => task(this)));
	}

	// [ Load routes ] =================================================================================
	#loadRoutes = () =>
		Utils.recursiveLookup(join(__dirname, "../routes/"), async (file) => {
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

			// Windows specific
			if (process.platform === "win32") file = `file://${file}`;

			this.froutes.set(path, (await import(file)).default);
			this[reqType](path, (await import(file)).default);

			Utils.info("Route", reqType.toUpperCase().yellow, path.cyan, "->", file.cyan);
		});

	// [ Run tasks after serve ] ==========================================================================
	runTaskAfter(...tasks: Function[]) {
		this.#runTaskAfter = this.#runTaskAfter.concat(tasks);

		return this;
	}

	// [ Run tasks before serve ] =========================================================================
	runTaskBefore(...tasks: Function[]) {
		this.#runTaskBefore = this.#runTaskBefore.concat(tasks);

		return this;
	}

	// [ Alternate to .use() with App ] ===================================================================
	useWithApp(path: string, func: (c: Context, n: Next, app: App) => Promise<Response | void>) {
		this.use(path, (ctx, nxt) => func(ctx, nxt, this));
	}

	// [ Task update page cache ] ==========================================================================
	static taskRebuildPageCache = () =>
		new Promise((res) => {
			PomdexCollection.find()
				.toArray()
				.then((list) => {
					const workQueue = async.queue((id: string, error) => {
						ky.head(`http://127.0.0.1:${process.env.PORT || 8080}/details/${id}`, {
							headers: {
								"User-Agent": CachedPage.UserAgent,
								"Rebuild-Cache": "1",
							},
							timeout: 3e3,
						})
							.then(() => error())
							.catch(() => {
								workQueue.push(id);
								error();
							});
					}, App.MaxConcurrency);

					for (const entry of list) workQueue.push(entry.id);
					workQueue.drain(() => {
						workQueue.kill();
						res(undefined);
					});
				});
		});
}

export { App };
