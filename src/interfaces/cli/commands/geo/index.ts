import { select } from "@inquirer/prompts";
import { Command } from "commander";

import { ConsoleLogger } from "@/core/logging/logger";
import { FOLDER_PATHS } from "@/domain/config/paths";
import { createAdapter } from "@/infrastructure/factories/geo";

const basePath = FOLDER_PATHS.geo;

export const geoCommand = (): Command => {
  const geoCommand = new Command("geo");
  geoCommand.description("Fetch geographic data from various sources");

  geoCommand
    .command("countries")
    .description("Fetch countries data from REST Countries API")
    .action(async () => {
      await fetchCountries(basePath);
    });

  geoCommand
    .command("eurostat")
    .description("Fetch European NUTS data from Eurostat")
    .option("-y, --year <year>", "NUTS year", "2024")
    .option("-p, --projection <projection>", "Projection EPSG code", "4326")
    .option("-s, --scale <scale>", "Map scale", "20M")
    .option("-l, --max-level <level>", "Maximum NUTS level", "3")
    .action(async (options) => {
      await fetchEurostat(basePath, options);
    });

  geoCommand
    .command("istat")
    .description("Fetch Italian administrative units from ISTAT")
    .action(async () => {
      await fetchIstat(basePath);
    });

  geoCommand
    .command("all")
    .description("Fetch data from all geographic sources")
    .option("-y, --year <year>", "NUTS year for Eurostat", "2024")
    .option(
      "-p, --projection <projection>",
      "Projection EPSG code for Eurostat",
      "4326",
    )
    .option("-s, --scale <scale>", "Map scale for Eurostat", "20M")
    .option("-l, --max-level <level>", "Maximum NUTS level for Eurostat", "3")
    .action(async (options) => {
      await fetchAllSources(basePath, options);
    });

  // Interactive mode when no subcommand is provided
  geoCommand
    .command("interactive", { isDefault: true })
    .description("Interactive geographic data fetching")
    .action(async () => {
      await runInteractiveMode(basePath);
    });

  return geoCommand;
};

const runInteractiveMode = async (basePath: string) => {
  const logger = ConsoleLogger.getInstance({ verbose: true });

  try {
    const action = await select({
      message: "What geographic data would you like to fetch?",
      choices: [
        { name: "Countries (REST Countries API)", value: "countries" },
        { name: "European NUTS (Eurostat)", value: "eurostat" },
        { name: "Italian Administrative Units (ISTAT)", value: "istat" },
        { name: "Fetch All Sources", value: "all" },
      ],
    });

    switch (action) {
      case "countries":
        await fetchCountries(basePath);
        break;
      case "eurostat":
        await fetchEurostat(basePath, {
          year: "2024",
          projection: "4326",
          scale: "20M",
          maxLevel: "3",
        });
        break;
      case "istat":
        await fetchIstat(basePath);
        break;
      case "all":
        await fetchAllSources(basePath, {
          year: "2024",
          projection: "4326",
          scale: "20M",
          maxLevel: "3",
        });
        break;
    }
  } catch (error) {
    logger.error(`Command failed: ${error}`);
    process.exit(1);
  }
};

const fetchCountries = async (basePath: string) => {
  const logger = ConsoleLogger.getInstance();
  const progress = logger.getProgress({ text: "Fetching countries data..." });

  try {
    const adapter = createAdapter("countries", basePath);
    await adapter.fetch({});
    progress.complete("Countries data fetched successfully");
  } catch (error) {
    progress.fail(`Failed to fetch countries data: ${error}`);
    throw error;
  }
};

const fetchEurostat = async (
  basePath: string,
  options: Record<string, string> = {},
) => {
  const logger = ConsoleLogger.getInstance();
  const progress = logger.getProgress({
    text: "Fetching Eurostat NUTS data...",
  });

  try {
    const adapter = createAdapter("eurostat", basePath);
    await adapter.fetch({
      year: options.year || "2024",
      projection: options.projection || "4326",
      scale: options.scale || "20M",
      maxLevel: options.maxLevel || "3",
    });
    progress.complete("Eurostat NUTS data fetched successfully");
  } catch (error) {
    progress.fail(`Failed to fetch Eurostat data: ${error}`);
    throw error;
  }
};

const fetchIstat = async (basePath: string) => {
  const logger = ConsoleLogger.getInstance();
  const progress = logger.getProgress({ text: "Fetching ISTAT data..." });

  try {
    const adapter = createAdapter("istat", basePath);
    await adapter.fetch({});
    progress.complete("ISTAT data fetched successfully");
  } catch (error) {
    progress.fail(`Failed to fetch ISTAT data: ${error}`);
    throw error;
  }
};

const fetchAllSources = async (
  basePath: string,
  options: Record<string, string> = {},
) => {
  const logger = ConsoleLogger.getInstance();
  logger.info("Fetching all geographic data sources...");

  await fetchCountries(basePath);
  await fetchEurostat(basePath, options);
  await fetchIstat(basePath);

  logger.success("All geographic data sources fetched successfully");
};
