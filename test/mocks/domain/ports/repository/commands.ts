import type { Repository } from "@/domain/models/repository";
import type { RepositoryCommandsPort } from "@/domain/ports/repository/commands";
import type { GithubRepository } from "@/shared/github/types";
import { sampleRepository } from "test/fixtures/entities/repository";
import { vi } from "vitest";

interface MockRepositoryCommandsOptions {
	/** Custom responses for specific repository fullNames */
	responses?: {
		/** Map of repository fullName to response for create method */
		create?: Record<string, Repository | undefined>;
		/** Map of repository id to response for update method */
		update?: Record<string, Repository | undefined>;
	};
	/** Configure error scenarios */
	errorScenarios?: {
		/** Repository fullNames that should trigger create errors */
		createErrors?: string[];
		/** Repository ids that should trigger update errors */
		updateErrors?: number[];
	};
	/** Default repository to return if no custom response defined */
	defaultRepository?: Repository;
}

/**
 * Creates a mock implementation of the RepositoryCommandsPort.
 *
 * @param options - Configuration options for the mock
 * @returns Mock implementation of RepositoryCommandsPort
 */
export function createMockRepositoryCommandsPort(
	options: MockRepositoryCommandsOptions = {},
): RepositoryCommandsPort {
	return {
		create: vi.fn().mockImplementation(async (data: GithubRepository) => {
			// Handle error scenarios by returning undefined (without throwing)
			if (options.errorScenarios?.createErrors?.includes(data.full_name)) {
				return undefined;
			}

			// Check for custom responses
			if (
				options.responses?.create &&
				data.full_name in options.responses.create
			) {
				return options.responses.create[data.full_name];
			}

			// Return default response
			if (options.defaultRepository) {
				return { ...options.defaultRepository, fullName: data.full_name };
			}

			// Return a default repository based on the input data
			return {
				...sampleRepository,
				fullName: data.full_name,
				name: data.name,
				description: data.description || null,
			};
		}),

		update: vi
			.fn()
			.mockImplementation(async (id: number, data: GithubRepository) => {
				// Handle error scenarios by returning undefined (without throwing)
				if (options.errorScenarios?.updateErrors?.includes(id)) {
					return undefined;
				}

				// Check for custom responses
				if (
					options.responses?.update &&
					id.toString() in options.responses.update
				) {
					return options.responses.update[id.toString()];
				}

				// Return default response
				if (options.defaultRepository) {
					return { ...options.defaultRepository, id, fullName: data.full_name };
				}

				// Return a default repository based on the input data
				return {
					...sampleRepository,
					id,
					fullName: data.full_name,
					name: data.name,
					description: data.description || null,
					updatedAt: new Date(),
				};
			}),
	};
}
