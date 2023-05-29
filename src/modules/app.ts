import { serve } from "@hono/node-server";
import async from "async";
import "colors";
import { readdirSync, statSync } from "fs";
import { Context, Env, Hono, Next } from "hono";
import ky from "ky";
import { cpus } from "os";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";
import { PomdexCollection } from "./database/index.js";
import { CachedPage } from "./middleware/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

class App extends Hono {
	static readonly MaxConcurrency = Number(process.env.MAX_CONCURRENCY) || cpus().length - 1;

	static info = (...args: unknown[]) => process.stdout.write(`${new Date().toISOString().grey} ${args.join(" ")}\n`);
	static error = (...args: unknown[]) => {
		const errorIndex = args.findIndex((arg) => arg instanceof Error);
		let errorObject: Error;

		if (errorIndex !== -1) {
			errorObject = args.splice(errorIndex, 1)[0] as Error;
		}

		process.stdout.write(`${new Date().toISOString().red} ${args.join(" ")}\n`);
		errorObject && console.error(errorObject);
	};
	static warn = (...args: unknown[]) =>
		process.stdout.write(`${new Date().toISOString().yellow} ${args.join(" ")}\n`);

	readonly froutes = new Map<string, (c: Context) => Promise<Response>>();
	#runTaskBefore: Function[] = [];
	#runTaskAfter: Function[] = [];

	readonly appOptions: {
		port?: string | number;
	};

	constructor(opts?: {
		honoOptions?: Partial<Pick<Hono<Env, {}, "/">, "router" | "getPath"> & { strict: boolean }>;
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
		App.info(`Starting with max concurrency tasks: ${App.MaxConcurrency}`.green);

		// Wait for all tasks to complete
		App.info("Waiting for all tasks to complete...".yellow);
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
		App.info("Server started on port".green, (this.appOptions?.port?.toString() || "8080").blue);

		// Running after tasks
		App.info("Running post tasks...".yellow);
		Promise.all(this.#runTaskAfter.map((task) => task(this))).catch(console.error);
	}

	// [ Load routes ] =================================================================================
	#loadRoutes = () =>
		recursiveLookup(join(__dirname, "../pages/"), async (file) => {
			let path = file
				.replace(join(__dirname, "../pages/"), "")
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

			App.info("Route", reqType.toUpperCase().yellow, path.cyan, "->", file.cyan);
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
								workQueue.push(id).catch(console.error);
								error();
							});
					}, App.MaxConcurrency);

					for (const entry of list) workQueue.push(entry.id).catch(console.error);
					workQueue.drain(() => {
						workQueue.kill();
						res(undefined);
					});
				})
				.catch(console.error);
		});
}

const recursiveLookup = async (path: string, callback: (path: string) => Promise<unknown>): Promise<void> => {
	for (const name of readdirSync(path)) {
		if (statSync(`${path}/${name}`).isDirectory()) {
			await recursiveLookup(`${path}/${name}`, callback);
		} else {
			await callback(`${path}/${name}`);
		}
	}
};

export { App };
