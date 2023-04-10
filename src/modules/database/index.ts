import { Account, MonthlyDyeEntry, ToramObject } from "../types/index.js";
import Utils from "../utils/index.js";
import { Database } from "./database.js";

const PomdexDatabase = new Database();
const PomdexCollection = PomdexDatabase.database("Pomie").collection<ToramObject>("Index");
const PomdexAccounts = PomdexDatabase.database("Pomie").collection<Account>("Accounts");
const PomdexMonthlyDye = PomdexDatabase.database("Pomie").collection<MonthlyDyeEntry>("MonthlyDye");
const taskConnectDatabase = () =>
	new Promise((resolve) => {
		// Connect to MongoDB
		PomdexDatabase.connect()
			.then(async () => {
				// Create index when needed
				if (!PomdexCollection.indexExists("name")) {
					await PomdexCollection.createIndex({ name: "text" });
				}

				Utils.info("Database connected".green);
				resolve(true);
			})
			.catch(Utils.error);
	});

export { PomdexDatabase, PomdexCollection, PomdexAccounts, PomdexMonthlyDye, taskConnectDatabase };
