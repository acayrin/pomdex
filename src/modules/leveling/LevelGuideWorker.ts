import "colors";
import { createHash } from "crypto";
import { cpus } from "os";
import { App } from "../app.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Worker } from "worker_threads";
import { GuideResult, GuideResultSuccess } from "./types/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

class LevelGuideWorker {
	static #opts: {
		timeout?: number;
		maxWorkers?: number;
		minWorkers?: number;
	} = {
		timeout: 300e3,
		maxWorkers: Number(process.env.MAX_CONCURRENCY) || cpus().length - 1,
		minWorkers: 1,
	};

	static #workers: {
		id: string;
		taskCount: number;
		lastTaskTime: number;
		workerInstance: Worker;
	}[] = [];

	/**
	 * Set options for Worker
	 * Defaults:
	 * - timeout: 300 seconds
	 * - min workers: 1
	 * - max workers: <max cpus count> - 1
	 * @param opts Options
	 * @returns Worker
	 */
	static setOptions = (opts?: { timeout?: number; maxWorkers?: number; minWorkers?: number }) => {
		if (opts.timeout) this.#opts.timeout = opts.timeout;
		if (opts.minWorkers) this.#opts.minWorkers = opts.minWorkers;
		if (opts.maxWorkers) this.#opts.minWorkers = opts.maxWorkers;

		return LevelGuideWorker;
	};

	/**
	 * Send level guide gen request to a worker
	 * @param command Command to send
	 * @returns Guide result object
	 */
	static requestLevelGuide = (command: string, index?: number): Promise<GuideResult> =>
		new Promise((resolve, reject) => {
			this.#allocateWorkers();

			const i = index || Math.floor(Math.random() * this.#workers.length);
			const wk = this.#workers.at(i);
			App.info("LEVEL".cyan, `Requesting worker #${wk.id}.`.gray);

			wk.taskCount++;
			wk.lastTaskTime = Date.now() + this.#opts.timeout;
			wk.workerInstance.postMessage(command);
			wk.workerInstance.on("message", (m: string) => {
				wk.taskCount--;
				try {
					const j: GuideResultSuccess = JSON.parse(m);

					resolve(j);
				} catch (err) {
					reject(err);
				}
			});
		});

	static #allocateWorkers = () => {
		if (this.#workers.length >= this.#opts.maxWorkers) return;

		App.info("LEVEL".cyan, `Allocating ${this.#opts.maxWorkers - this.#workers.length} workers.`.gray);

		for (let i = this.#workers.length; i < this.#opts.maxWorkers; i++) {
			this.#workers.push({
				id: createHash("md5").update(Date.now().toString()).digest("hex").slice(0, 4),
				taskCount: 0,
				lastTaskTime: Date.now() + this.#opts.timeout,
				workerInstance: new Worker(join(__dirname, "./levelGuideGenerator.js")),
			});
		}
	};

	static #terminateWorker = (i: number) => {
		const wk = Object.assign({}, this.#workers.splice(i, 1).at(0));

		wk.workerInstance
			.terminate()
			.then(() => {
				App.info("LEVEL".cyan, `Worker #${wk.id} terminated.`.gray);
			})
			.catch(console.error);
	};

	static #interval = setInterval(() => {
		if (this.#workers.length <= this.#opts.minWorkers) return;

		for (const wk of this.#workers) {
			if (Date.now() > wk.lastTaskTime) {
				this.#terminateWorker(this.#workers.indexOf(wk));
			}
		}
	}, 1e3);
}

export { LevelGuideWorker as Worker };
