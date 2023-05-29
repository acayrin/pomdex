import "colors";
import dotenv from "dotenv";
import { Db, MongoClient } from "mongodb";
import { App } from "../app.js";
dotenv.config();

export class Database extends MongoClient {
	connected = false;
	#mongoDatabases = new Map<string, Db>();

	constructor() {
		super(
			process.env.MONGODB_URL.replace(/%user%/gi, process.env.MONGODB_USER).replace(
				/%password%/gi,
				encodeURIComponent(process.env.MONGODB_PASSWORD)
			),
			{
				compressors: "zlib",
				connectTimeoutMS: 10e3,
				serverSelectionTimeoutMS: 10e3,
			}
		);

		this.on("connectionReady", () => {
			this.connected = true;
		});
		this.on("error", (err) => {
			App.error(err);
		});
		this.on("timeout", () => {
			App.error("Task timed out");
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

	#removeDatabase(name: string) {
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
				})
				.catch(reject);
		});
	}

	#removeCollection(name: string, collection: string) {
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
				})
				.catch(reject);
		});
	}
}
