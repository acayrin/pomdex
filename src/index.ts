import { taskCompileComponents } from "./layouts/base/_static/precompile.js";
import { App } from "./modules/app.js";
import { taskConnectDatabase } from "./modules/database/index.js";
import { CachedPage, logger } from "./modules/middleware/index.js";
import { task2WeeklyScrapeAll, taskDailyRefreshDyeTable } from "./modules/scraper/index.js";

const app = new App({
	honoOptions: { strict: true },
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

app.serve().catch(console.error);
