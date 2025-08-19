import { Command } from "commander";

import { listCommands } from "./lists";
import { metadataCommand, syncCommand } from "./repository";

export const githubCommands = () => {
  const assets = new Command("github");

  assets
    .description("GitHub management tools")
    .addCommand(metadataCommand())
    .addCommand(listCommands())
    .addCommand(syncCommand());

  return assets;
};
