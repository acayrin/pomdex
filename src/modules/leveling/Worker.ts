import "colors";
import { cpus } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import worker from "worker_threads";
import Utils from "../utils/index.js";
import { GuideResult, GuideResultSuccess } from "./types/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

class Worker {
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
		timeout: NodeJS.Timeout;
		count: number;
		worker: worker.Worker;
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
		Worker.#opts = opts;

		return Worker;
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
			const w = this.#workers[i];
			Utils.info("LEVEL".cyan, `Requesting worker #${i}.`.gray);

			clearTimeout(w.timeout);
			w.count++;
			w.worker.postMessage(command);
			w.worker.on("message", (m) => {
				w.count--;
				w.timeout = setTimeout(() => this.#terminateWorker(i), this.#opts.timeout);

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

		Utils.info("LEVEL".cyan, `Allocating ${this.#opts.maxWorkers} workers.`.gray);

		for (let i = 0; i < this.#opts.maxWorkers; i++) {
			this.#workers[i] = {
				count: 0,
				timeout: setTimeout(() => this.#terminateWorker(i), this.#opts.timeout),
				worker: new worker.Worker(join(__dirname, "./LevelGuide.js")),
			};
		}
	};

	static #terminateWorker = (i: number) => {
		if (this.#workers.length <= this.#opts.minWorkers) return;

		const wk = this.#workers.splice(i, 1).at(0);
		wk.worker.terminate().then(() => {
			Utils.info("LEVEL".cyan, `Worker #${i} terminated.`.gray);
		});
	};
}

export { Worker };
