import type { Change } from "@/core/changes/types";
import type { ObsidianTheme } from "@/shared/obsidian/types";
import type { ObsidianThemeMetadata } from "../../value-objects/metadata/obsidian";
import { BaseSystemListHandler } from "./base";

/**
 * Handler for Obsidian theme changes.
 * Handles changes for themes and their metadata.
 */
export class ObsidianThemeHandler extends BaseSystemListHandler<
	ObsidianTheme,
	ObsidianThemeMetadata
> {
	protected async createMetadata(
		change: Change<ObsidianTheme>,
	): Promise<ObsidianThemeMetadata> {
		return {
			system: {
				systemType: "obsidian-theme",
				version: "1.0",
				createdAt: new Date().toISOString(),
				updatedAt: change.timestamp,
			},
			metadataTypes: ["obsidian-theme"],
			theme: change.data,
		};
	}
}
