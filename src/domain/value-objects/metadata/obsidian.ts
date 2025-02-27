import type {
	ObsidianPlugin,
	ObsidianPluginStats,
	ObsidianTheme,
} from "@/shared/obsidian/types";
import { z } from "zod";
import {
	type BaseSystemMetadata,
	type ListItemMetadata,
	baseSystemMetadataSchema,
} from "./base";

export interface ObsidianPluginMetadata extends ListItemMetadata {
	system: BaseSystemMetadata & {
		systemType: "obsidian-plugin";
	};
	metadataTypes: ["obsidian-plugin", "obsidian-stats", "deprecation"];
	plugin: ObsidianPlugin;
	stats: ObsidianPluginStats;
	deprecation?: string[];
}

export interface ObsidianThemeMetadata extends ListItemMetadata {
	system: BaseSystemMetadata & {
		systemType: "obsidian-theme";
	};
	metadataTypes: ["obsidian-theme"];
	theme: ObsidianTheme;
}

export const obsidianPluginSchema = z.object({
	system: baseSystemMetadataSchema.extend({
		systemType: z.literal("obsidian-plugin"),
	}),
	metadataTypes: z.tuple([
		z.literal("obsidian-plugin"),
		z.literal("obsidian-stats"),
		z.literal("deprecation"),
	]),
	plugin: z.object({
		id: z.string(),
		name: z.string(),
		author: z.string(),
		description: z.string(),
		repo: z.string(),
	}),
	stats: z.object({
		downloads: z.number(),
		updated: z.number(),
		versions: z.record(z.string(), z.number()).optional(),
	}),
	deprecation: z
		.object({
			id: z.string(),
			name: z.string(),
			reason: z.string(),
		})
		.optional(),
});

export const obsidianThemeSchema = z.object({
	system: baseSystemMetadataSchema.extend({
		systemType: z.literal("obsidian-theme"),
	}),
	metadataTypes: z.tuple([z.literal("obsidian-theme")]),
	theme: z.object({
		name: z.string(),
		author: z.string(),
		repo: z.string(),
		screenshot: z.string(),
		modes: z.array(z.enum(["dark", "light"])),
		legacy: z.boolean().optional(),
	}),
});
