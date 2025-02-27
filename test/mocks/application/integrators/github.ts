import type { GithubIntegrator } from "@/application/integration/github";
import type { ProcessingOptionsBase } from "@/domain/config/processing";
import type { Repository } from "@/domain/models/repository";
import type { GithubRepository } from "@/shared/github/types";
import { sampleGithubRepository } from "test/fixtures/api-responses/github";
import { vi } from "vitest";

export interface MockGithubIntegratorOptions {
	repositoryResponses?: Record<
		string,
		{
			raw: GithubRepository;
			transformed: Repository;
		}
	>;
	errorScenarios?: {
		apiErrors?: string[];
		fetchErrors?: string[];
	};
}

export function createMockGithubIntegrator(
	options: MockGithubIntegratorOptions = {},
): GithubIntegrator {
	return {
		fetchRepository: vi
			.fn()
			.mockImplementation(
				async (repoString: string, fetchOptions?: ProcessingOptionsBase) => {
					// Check if this repo should trigger an error
					if (options.errorScenarios?.apiErrors?.includes(repoString)) {
						throw new Error("GitHub API error");
					}

					if (options.errorScenarios?.fetchErrors?.includes(repoString)) {
						throw new Error("Failed to fetch repository");
					}

					// Check for custom responses
					if (
						options.repositoryResponses &&
						repoString in options.repositoryResponses
					) {
						return options.repositoryResponses?.[repoString]?.raw;
					}

					// Return a default response
					return sampleGithubRepository;
				},
			),

		findAllSnapshots: vi.fn().mockResolvedValue([sampleGithubRepository]),
	} as unknown as GithubIntegrator;
}
