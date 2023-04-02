import Utils from "../utils/index.js";
import { Account } from "../_types/account.js";
import { ToramObject } from "../_types/toram.js";
import { Database } from "./index.js";

const PomdexDatabase = new Database();
export const PomdexCollection = PomdexDatabase.database("Pomie").collection<ToramObject>("Index");
export const PomdexAccounts = PomdexDatabase.database("Pomie").collection<Account>("Accounts");
export const loadDatabase = () =>
	new Promise((resolve, reject) => {
		// Connect to MongoDB
		PomdexDatabase.connect()
			.then(() => {
				Utils.info("Database connected".green);
				resolve(true);
			})
			.catch(Utils.error);
	});
