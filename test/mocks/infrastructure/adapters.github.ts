// test/mocks/sources/github.ts

import type { GithubAdapter } from "@/infrastructure/adapters/github/adapter";
import { sampleGithubRepository } from "test/fixtures/api-responses/github";
import { vi } from "vitest";

export interface MockGithubAdapterOptions {
	/** Custom repository responses for specific repository paths */
	customRepositories?: Record<string, typeof sampleGithubRepository>;
	/** Custom file content responses for specific file paths */
	customFileContent?: Record<string, unknown>;
	/** Simulate API errors for specific operations */
	errorScenarios?: {
		apiErrors?: string[];
		repositoryErrors?: string[];
		fileErrors?: string[];
	};
}

export const createMockGithubAdapter = (options?: MockGithubAdapterOptions) =>
	({
		getRepository: vi.fn().mockImplementation(async (repo: string) => {
			// Check for error scenarios
			if (options?.errorScenarios?.apiErrors?.includes(repo)) {
				throw new Error("API rate limit exceeded");
			}
			if (options?.errorScenarios?.repositoryErrors?.includes(repo)) {
				throw new Error("GitHub API error");
			}
			// Check for custom responses
			if (options?.customRepositories?.[repo]) {
				return options.customRepositories[repo];
			}
			// Return default response
			if (repo === "updated/repo") {
				return {
					...sampleGithubRepository,
					stargazers_count: 200,
				};
			}
			return sampleGithubRepository;
		}),

		getFile: vi.fn().mockImplementation(async (repo: string, path: string) => {
			// Check for error scenarios
			if (options?.errorScenarios?.apiErrors?.includes(path)) {
				throw new Error("API rate limit exceeded");
			}
			if (options?.errorScenarios?.fileErrors?.includes(path)) {
				throw new Error("File not found");
			}

			// Check for custom responses
			if (options?.customFileContent?.[path]) {
				return options.customFileContent[path];
			}
			// Return default response
			return undefined;
		}),
	}) as unknown as GithubAdapter;
