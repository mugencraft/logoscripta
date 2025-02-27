import type { Repository } from "@/domain/models/repository";
import type { RepositoryQueriesPort } from "@/domain/ports/repository/queries";
import { sampleRepository } from "test/fixtures/entities/repository";
import { vi } from "vitest";

interface MockRepositoryQueriesOptions {
	/** Custom responses for specific repository paths */
	responses?: {
		/** Map of repository fullName to response for findByName method */
		findByName?: Record<string, Repository | undefined>;
		/** Map of repository id to response for findById method */
		findById?: Record<string, Repository | undefined>;
	};
	/** Configure error scenarios */
	errorScenarios?: {
		/** Repository fullNames that should trigger findByName errors */
		findByNameErrors?: string[];
		/** Repository ids that should trigger findById errors */
		findByIdErrors?: number[];
	};
	/** Default repository to return if no custom response defined */
	defaultRepository?: Repository | undefined;
}

/**
 * Creates a mock implementation of the RepositoryQueriesPort.
 *
 * @param options - Configuration options for the mock
 * @returns Mock implementation of RepositoryQueriesPort
 */
export function createMockRepositoryQueriesPort(
	options: MockRepositoryQueriesOptions = {},
): RepositoryQueriesPort {
	return {
		findByName: vi.fn().mockImplementation(async (repoString: string) => {
			// Check for error scenarios
			if (options.errorScenarios?.findByNameErrors?.includes(repoString)) {
				throw new Error(`Failed to find repository: ${repoString}`);
			}

			// Check for custom responses
			if (
				options.responses?.findByName &&
				repoString in options.responses.findByName
			) {
				return options.responses.findByName[repoString];
			}

			// If explicitly undefined in defaultRepository, return undefined
			if (options.defaultRepository === undefined) {
				return undefined;
			}

			// Return default sample repository with the right name if one wasn't specified
			if (!options.defaultRepository) {
				const [owner, repo] = repoString.split("/");
				if (!owner || !repo) {
					return undefined;
				}
				return {
					...sampleRepository,
					fullName: repoString,
					name: repo,
				};
			}

			// Return provided default repository with the fullName updated
			return {
				...options.defaultRepository,
				fullName: repoString,
			};
		}),

		findById: vi.fn().mockImplementation(async (repositoryId: number) => {
			// Check for error scenarios
			if (options.errorScenarios?.findByIdErrors?.includes(repositoryId)) {
				throw new Error(`Failed to find repository by id: ${repositoryId}`);
			}

			// Check for custom responses
			if (
				options.responses?.findById &&
				repositoryId.toString() in options.responses.findById
			) {
				return options.responses.findById[repositoryId.toString()];
			}

			// If explicitly undefined in defaultRepository, return undefined
			if (options.defaultRepository === undefined) {
				return undefined;
			}

			// Return default repository if none specified
			if (!options.defaultRepository) {
				return {
					...sampleRepository,
					id: repositoryId,
				};
			}

			// Return provided default repository with the id updated
			return {
				...options.defaultRepository,
				id: repositoryId,
			};
		}),
	};
}
