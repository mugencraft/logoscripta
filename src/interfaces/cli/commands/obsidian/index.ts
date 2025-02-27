import { Command } from "commander";
import { releasesCommands } from "./releases";

export const obsidianCommands = () => {
	const assets = new Command("obsidian");

	assets
		.description("Obsidian management tools")
		.addCommand(releasesCommands());

	return assets;
};
