import "colors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import worker from "worker_threads";
import { App } from "../app.js";
import Utils from "../utils/index.js";
import { GuideResult, GuideResultSuccess } from "./types/index.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

class Worker {
	static #workers: {
		timeout: NodeJS.Timeout;
		count: number;
		worker: worker.Worker;
	}[] = [];

	static #allocateWorkers = () => {
		if (this.#workers.length >= App.MaxConcurrency) return;

		Utils.info("LEVEL".cyan, `Allocating ${App.MaxConcurrency} workers.`.gray);

		for (let i = 0; i < App.MaxConcurrency; i++) {
			this.#workers[i] = {
				count: 0,
				timeout: setTimeout(() => {
					this.#workers[i]?.worker.terminate().then(() => {
						Utils.info("LEVEL".cyan, `Worker #${i} terminated.`.gray);
						this.#workers.splice(i, 1);
					});
				}, 300e3), // 5 min
				worker: new worker.Worker(join(__dirname, "./LevelGuide.js")),
			};
		}
	};

	static requestLevelGuide = (command: string): Promise<GuideResult> =>
		new Promise((resolve, reject) => {
			this.#allocateWorkers();

			const i = Math.floor(Math.random() * this.#workers.length);
			const w = this.#workers[i];
			Utils.info("LEVEL".cyan, `Requesting worker #${i}.`.gray);

			clearTimeout(w.timeout);
			w.count++;
			w.worker.postMessage(command);
			w.worker.on("message", (m) => {
				w.count--;
				w.timeout = setTimeout(() => {
					this.#workers[i]?.worker.terminate().then(() => {
						Utils.info("LEVEL".cyan, `Worker #${i} terminated.`.gray);
						this.#workers.splice(i, 1);
					});
				}, 300e3);

				try {
					const j: GuideResultSuccess = JSON.parse(m);

					resolve(j);
				} catch (err) {
					reject(err);
				}
			});
		});
}

export { Worker };
