import type { ChangeDetectorConfig } from "@/core/changes/types";
import type { ProcessingOptions } from "@/domain/config/processing";

export interface GithubIntegratorOptions extends ProcessingOptions {
	/** Configuration for change detection */
	changeConfig: ChangeDetectorConfig;
}

export interface GitHubProcessorOptions extends ProcessingOptions {
	/** GitHub API authentication token */
	token?: string;
}

export interface MetadataCommandOptions extends GitHubProcessorOptions {
	source?: string;
	repo?: string;
}
