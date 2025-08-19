import { vi } from "vitest";

import type { Repository } from "@/domain/models/github/repository";
import type { GithubIntegrator } from "@/domain/services/github/integration/github";
import type { GithubRepository } from "@/shared/github/types";

import { sampleGithubRepository } from "test/fixtures/api-responses/github";

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
    fetchRepository: vi.fn().mockImplementation(async (repoString: string) => {
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
    }),

    findAllSnapshots: vi.fn().mockResolvedValue([sampleGithubRepository]),
  } as unknown as GithubIntegrator;
}
