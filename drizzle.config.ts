import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "drizzle-kit";
import { DEFAULT_APP_CONFIG } from "./src/domain/config/defaults/app";

const loadConfigSync = () => {
	const configPath = join(process.cwd(), ".config/logoscripta.json");
	const configFile = readFileSync(configPath, "utf-8");
	return { ...JSON.parse(configFile), ...DEFAULT_APP_CONFIG };
};

const { paths } = loadConfigSync();

export default defineConfig({
	schema: "./src/domain/persistence/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	dbCredentials: {
		url: `file:${join(paths.db, "drizzle.db")}`,
	},
	verbose: true,
	strict: true,
});
