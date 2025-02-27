import { type AppConfig, configSchema } from "@/domain/config/app";
import { DEFAULT_APP_CONFIG } from "@/domain/config/defaults/app";
import { input, select } from "@inquirer/prompts";
import { z } from "zod";

type ConfigQuestion = {
	message: string;
	type: "input" | "select";
	choices?: Array<{
		name: string;
		value: string;
		description?: string;
	}>;
};

type ConfigSection = {
	title: string;
	fields: Record<string, ConfigQuestion>;
};

// Configuration metadata for generating questions
const configSections: Record<keyof AppConfig, ConfigSection> = {
	paths: {
		title: "Base Paths Configuration",
		fields: {
			config: {
				message: "Enter the path for the logoscripta.json config file:",
				type: "input",
			},
			db: {
				message: "Enter the path for the database:",
				type: "input",
			},
			github: {
				message: "Enter the path for GitHub data:",
				type: "input",
			},
			obsidian: {
				message: "Enter the path for Obsidian data:",
				type: "input",
			},
		},
	},
	github: {
		title: "GitHub Integration Configuration",
		fields: {
			token: {
				message: "Enter your GitHub API token (optional):",
				type: "input",
			},
		},
	},
	logging: {
		title: "Logging Configuration",
		fields: {
			level: {
				message: "Select logging level:",
				type: "select",
				choices: [
					{ name: "Error", value: "error" },
					{ name: "Warning", value: "warn" },
					{ name: "Info", value: "info" },
					{ name: "Debug", value: "debug" },
				],
			},
		},
	},
};

async function promptSection(
	section: keyof AppConfig,
): Promise<Record<string, unknown>> {
	const sectionConfig = configSections[section];
	const result: Record<string, unknown> = {};

	console.log(`\n--- ${sectionConfig.title} ---`);

	for (const [field, fieldConfig] of Object.entries(sectionConfig.fields)) {
		const defaultValue =
			DEFAULT_APP_CONFIG[section] &&
			(DEFAULT_APP_CONFIG[section] as Record<string, unknown>)[field];

		if (fieldConfig.type === "select" && fieldConfig.choices) {
			result[field] = await select({
				message: fieldConfig.message,
				choices: fieldConfig.choices,
				default: defaultValue as string,
			});
		} else {
			result[field] = await input({
				message: fieldConfig.message,
				default: defaultValue as string,
			});
		}
	}

	return result;
}

export async function initConfig(): Promise<AppConfig> {
	try {
		const config: Record<string, Record<string, unknown>> = {};

		for (const section of Object.keys(configSections) as Array<
			keyof AppConfig
		>) {
			config[section] = await promptSection(section);
		}

		return configSchema.parse(config);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(`Configuration validation failed: ${error.message}`);
		}
		throw error;
	}
}
