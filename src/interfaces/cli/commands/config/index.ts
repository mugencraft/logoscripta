import { join } from "node:path";
import { ConsoleLogger } from "@/core/logging/logger";
import { saveJson } from "@/core/serialization/json";
import { useConfig } from "@/domain/config/useConfig";
import { Command } from "commander";
import { initConfig } from "./init";

export const configCommands = () => {
	const config = new Command("config").description("Configuration management");

	config
		.command("init")
		.description("Initialize or update configuration file")
		.option("-v, --verbose", "enable verbose logging")
		.action(async ({ verbose }) => {
			try {
				const config = await initConfig();
				const configFile = join(
					process.cwd(),
					config.paths.config,
					"logoscripta.json",
				);
				saveJson(config, configFile);
			} catch (error) {
				const logger = ConsoleLogger.getInstance({ verbose });
				logger.error(`Failed to initialize config: ${error}`);
				process.exit(1);
			}
		});

	config
		.command("show")
		.description("Show current configuration")
		.option("-v, --verbose", "enable verbose logging")
		.action(async ({ verbose }) => {
			const logger = ConsoleLogger.getInstance({ verbose });
			try {
				const { config, configFile } = await useConfig();
				logger.success(`Configuration loaded from ${configFile}`);
				logger.info(config);
			} catch (error) {
				logger.error(`Failed to load config: ${error}`);
				process.exit(1);
			}
		});

	return config;
};
