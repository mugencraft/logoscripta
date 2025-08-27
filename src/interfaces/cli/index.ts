import { Command } from "commander";

import { configCommands } from "./commands/config";
import { geoCommand } from "./commands/geo";
import { githubCommands } from "./commands/github";
import { obsidianCommands } from "./commands/obsidian";

export const createCLI = () => {
  const program = new Command()
    .name("logoscripta")
    .description("ETL & Content Management CLI tool belt")
    .version("0.1.0");

  program.addCommand(configCommands());
  program.addCommand(githubCommands());
  program.addCommand(obsidianCommands());
  program.addCommand(geoCommand());

  return program;
};
