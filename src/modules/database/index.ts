import "colors";
import { Db, MongoClient } from "mongodb";
import Utils from "../utils/index.js";
import dotenv from "dotenv";
dotenv.config();

export class Database extends MongoClient {
	#connected = false;
	#mongoDatabases = new Map<string, Db>();

	constructor() {
		super(
			process.env.MONGODB_URL.replace(/\%user\%/gi, process.env.MONGODB_USER).replace(
				/\%password\%/gi,
				encodeURIComponent(process.env.MONGODB_PASSWORD)
			),
			{
				heartbeatFrequencyMS: 3e3,
				compressors: "snappy",
				localThresholdMS: 0,
			}
		);

		this.on("connectionReady", () => {
			this.#connected = true;
		});
		this.on("error", (err) => {
			Utils.error(err);
		});
		this.on("timeout", () => {
			Utils.error("Task timed out");
		});
	}

	database(name: string) {
		this.#mongoDatabases.set(name, this.db(name));

		return this.#mongoDatabases.get(name);
	}

	collection(name: string, collection: string) {
		if (!this.#mongoDatabases.has(name)) this.database(name);

		return this.#mongoDatabases.get(name).collection(collection);
	}

	async removeDatabase(name: string) {
		if (!this.#connected) await this.connect();

		return new Promise((resolve, reject) => {
			this.db(name)
				.dropDatabase()
				.then((result) => {
					if (result) {
						this.#mongoDatabases.delete(name);

						resolve(true);
					} else {
						reject(false);
					}
				});
		});
	}

	async removeCollection(name: string, collection: string) {
		if (!this.#connected) await this.connect();

		return new Promise((resolve, reject) => {
			this.#mongoDatabases
				.get(name)
				.dropCollection(collection)
				.then((result) => {
					if (result) {
						resolve(true);
					} else {
						reject(false);
					}
				});
		});
	}
}
