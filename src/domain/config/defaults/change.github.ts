import type { ChangeDetectorConfig } from "@/core/changes/types";

/**
 * Change detection configuration for GitHub repositories
 */
export const githubRepositoryConfig: ChangeDetectorConfig = {
	/** Field used as unique identifier */
	idField: "full_name",
	/** Fields that trigger full updates when changed */
	trackedFields: ["name", "description", "topics", "language", "visibility"],
	/** Fields that trigger state updates */
	updateFields: [
		"name",
		"description",
		"topics",
		"visibility",
		"is_archived",
		"is_disabled",
	],
	/** Fields that trigger soft updates */
	softUpdateFields: [
		"stargazers_count",
		"subscribers_count",
		"forks_count",
		"open_issues_count",
	],
};
