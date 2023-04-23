import { taskCompileComponents } from "./components/_base/_static/precompile.js";
import { App } from "./modules/app.js";
import { taskConnectDatabase } from "./modules/database/index.js";
import CachedPage from "./modules/middleware/cacher/index.js";
import { logger } from "./modules/middleware/logger.js";
import { task2WeeklyScrapeAll, taskDailyRefreshDyeTable } from "./modules/scraper/index.js";

const app = new App({
	honoOptions: { strict: false },
	appOptions: { port: process.env.PORT },
});
app.use("*", logger());
app.useWithApp(
	"*",
	new CachedPage(app, {
		logLevel: "all",
		ignoreAll: [/\/api\/.+/gi, /\/user\/logout/gi],
		ignoreCaching: [/\/manage/gi, /\/user\/info/gi],
		//redirectRules: new Map([[/^\/details\/.{0,5}(?<![.*])$/gi, "/details"]]),
	}).bind
);
app.runTaskBefore(taskConnectDatabase);
app.runTaskBefore(taskCompileComponents);
app.runTaskAfter(taskDailyRefreshDyeTable);
app.runTaskAfter(task2WeeklyScrapeAll);

app.serve();
