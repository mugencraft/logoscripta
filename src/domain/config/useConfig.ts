import { loadConfig } from "c12";
import type { AppConfig } from "./app";
import { DEFAULT_APP_CONFIG } from "./defaults/app";
/**
 * Loads the configuration from the specified file.
 * If the file does not exist, it is created with the default configuration.
 * The configuration is cached for future use.
 *
 * @returns The configuration object
 */
export const useConfig = async () => {
	const { config, configFile, layers } = await loadConfig<AppConfig>({
		name: "logoscripta",
		defaults: DEFAULT_APP_CONFIG,
		packageJson: true,
		envName: process.env.NODE_ENV,
	});

	return { config, configFile, layers };
};
