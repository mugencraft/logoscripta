import type { GithubCommands } from "@/application/commands/github";
import type { Repository } from "@/domain/models/repository";
import { sampleRepository } from "test/fixtures/entities/repository";
import { vi } from "vitest";

export interface MockGithubProcessorOptions {
	/** Custom repository responses for specific repository names */
	repositoryResponses?: Record<string, Repository>;
	/** Custom save behavior for specific repository names */
	saveResponses?: Record<string, Repository>;
	/** Configure error scenarios for processor operations */
	errorScenarios?: {
		findErrors?: string[];
		saveErrors?: string[];
	};
	/** Default response for repository operations if no custom response is configured */
	defaultRepository?: Repository;
}

export const createMockGithubProcessor = (
	options?: MockGithubProcessorOptions,
) =>
	({
		saveRepository: vi.fn().mockImplementation(async (repoString: string) => {
			if (options?.errorScenarios?.saveErrors?.includes(repoString)) {
				// Check for error scenarios
				throw new Error(`Failed to save repository: ${repoString}`);
			}

			// Check for custom responses
			if (options?.saveResponses?.[repoString]) {
				return options.saveResponses[repoString];
			}

			// Return default response
			return options?.defaultRepository ?? sampleRepository;
		}),
	}) as unknown as GithubCommands;
