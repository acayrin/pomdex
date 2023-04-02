import { precompileComponents } from "./components/_base/_static/precompile.js";
import { App } from "./modules/app.js";
import { loadDatabase } from "./modules/database/init.js";
import { preloadLevelModels } from "./modules/leveling/task.js";
import { CachedPage } from "./modules/middleware/cachedPage.js";
import { logger } from "./modules/middleware/logger.js";

const app = new App({
	honoOptions: {
		strict: false,
	},
	appOptions: {
		port: process.env.PORT,
	},
});

app.use("*", logger());
app.useWithApp(
	"*",
	CachedPage({
		ignoreRules: [/\/api\/\w+/gi, /\/manage/gi],
		redirectRules: new Map([[/^\/details\/.{0,5}(?<![.*])$/gi, "/details"]]),
	})
);

app.runTaskBefore(loadDatabase);
app.runTaskBefore(precompileComponents);
app.runTaskAfter(preloadLevelModels);

app.serve();
