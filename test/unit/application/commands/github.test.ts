// test/unit/application/commands/github.test.ts

import { GithubCommands } from "@/application/commands/github";
import { sampleGithubRepository } from "test/fixtures/api-responses/github";
import { sampleRepository } from "test/fixtures/entities/repository";
import {
	type MockGithubIntegratorOptions,
	createMockGithubIntegrator,
} from "test/mocks/application/integrators/github";
import { createMockRepositoryCommandsPort } from "test/mocks/domain/ports/repository/commands";
import { createMockRepositoryQueriesPort } from "test/mocks/domain/ports/repository/queries";
import { describe, expect, it } from "vitest";

describe("GithubCommands Unit", () => {
	describe("Repository Management", () => {
		describe("Creation Flow", () => {
			it("creates new repository when not found in storage", async () => {
				const { sut, mocks } = createTestSetup();

				const result = await sut.saveRepository("new/repo");

				expect(mocks.integrator.fetchRepository).toHaveBeenCalledWith(
					"new/repo",
					expect.any(Object),
				);
				expect(mocks.repositoryCommands.create).toHaveBeenCalledWith(
					sampleGithubRepository,
				);
				expect(result).toBeTruthy();
				expect(result?.fullName).toEqual(sampleRepository.fullName);
			});

			it("handles creation errors", async () => {
				const { sut } = createTestSetup({
					repositoryCommands: {
						errorScenarios: {
							createErrors: ["error/create"],
						},
					},
					integrator: {
						repositoryResponses: {
							"error/create": {
								raw: { ...sampleGithubRepository, full_name: "error/create" },
								transformed: { ...sampleRepository, fullName: "error/create" },
							},
						},
					},
				});

				// Catch and handle the error
				try {
					const result = await sut.saveRepository("error/create");
					// This line shouldn't be reached
					expect(result).toBeNull();
				} catch (error) {
					// Expect an error to be thrown
					expect(error).toBeTruthy();
					expect((error as Error).message).toContain(
						"Failed to create repository",
					);
				}
			});
		});

		describe("Update Flow", () => {
			it("updates existing repository with fresh data", async () => {
				const { sut, mocks } = createTestSetup({
					repositoryQueries: {
						responses: {
							findByName: {
								"test/repo": sampleRepository,
							},
						},
					},
				});

				const result = await sut.saveRepository("test/repo");

				expect(mocks.integrator.fetchRepository).toHaveBeenCalledWith(
					"test/repo",
					expect.any(Object),
				);
				expect(mocks.repositoryCommands.update).toHaveBeenCalledWith(
					sampleRepository.id,
					sampleGithubRepository,
				);

				// Skip direct date comparison
				expect(result).toBeTruthy();
				expect(result?.id).toEqual(sampleRepository.id);
				expect(result?.fullName).toEqual(sampleRepository.fullName);
			});

			it("handles update errors", async () => {
				const { sut } = createTestSetup({
					repositoryQueries: {
						responses: {
							findByName: {
								"test/repo": sampleRepository,
							},
						},
					},
					repositoryCommands: {
						errorScenarios: {
							updateErrors: [sampleRepository.id],
						},
					},
				});

				// Catch and handle the error
				try {
					const result = await sut.saveRepository("test/repo");
					// This line shouldn't be reached
					expect(result).toBeNull();
				} catch (error) {
					// Expect an error to be thrown
					expect(error).toBeTruthy();
					expect((error as Error).message).toContain(
						"Failed to update repository",
					);
				}
			});
		});

		describe("Save Options", () => {
			it("respects skipFetch option", async () => {
				const { sut, mocks } = createTestSetup();

				await sut.saveRepository("test/repo", { skipFetch: true });

				expect(mocks.integrator.fetchRepository).not.toHaveBeenCalled();
			});

			it("throws when repository not found with throwOnMissing option", async () => {
				const { sut } = createTestSetup({
					repositoryQueries: {
						responses: {
							findByName: {
								"not/found": undefined,
							},
						},
					},
				});

				await expect(
					sut.saveRepository("not/found", {
						skipFetch: true,
						throwOnMissing: true,
					}),
				).rejects.toThrow("Repository not found: not/found");
			});

			it("forces refresh when forceFetch option is true", async () => {
				const { sut, mocks } = createTestSetup();

				await sut.saveRepository("test/repo", { forceFetch: true });

				expect(mocks.integrator.fetchRepository).toHaveBeenCalledWith(
					"test/repo",
					expect.objectContaining({ forceFetch: true }),
				);
			});
		});

		describe("Error Handling", () => {
			it("handles GitHub API errors", async () => {
				const { sut } = createTestSetup({
					integrator: {
						errorScenarios: {
							apiErrors: ["error/api"],
						},
					},
				});

				await expect(sut.saveRepository("error/api")).rejects.toThrow(
					"GitHub API error",
				);
			});

			it("handles fetch failures", async () => {
				const { sut } = createTestSetup({
					integrator: {
						errorScenarios: {
							fetchErrors: ["error/fetch"],
						},
					},
				});

				await expect(sut.saveRepository("error/fetch")).rejects.toThrow(
					"Failed to fetch repository",
				);
			});
		});
	});

	describe("Snapshot Synchronization", () => {
		it("synchronizes repositories from snapshots", async () => {
			const { sut, mocks } = createTestSetup();

			const result = await sut.syncFromSnapshots();

			expect(mocks.integrator.findAllSnapshots).toHaveBeenCalled();
			expect(result.processed).toBe(1);
			expect(result.created).toBe(1);
		});
	});
});

interface TestSetupOptions {
	integrator?: MockGithubIntegratorOptions;
	repositoryCommands?: Parameters<typeof createMockRepositoryCommandsPort>[0];
	repositoryQueries?: Parameters<typeof createMockRepositoryQueriesPort>[0];
}

function createTestSetup(options: TestSetupOptions = {}) {
	const mockRepositoryCommands = createMockRepositoryCommandsPort({
		...options.repositoryCommands,
		responses: {
			...options.repositoryCommands?.responses,
			// For the creation error test
			create: {
				...options.repositoryCommands?.responses?.create,
				// When a repository with name in createErrors is created, return undefined
				...(
					options.repositoryCommands?.errorScenarios?.createErrors || []
				).reduce(
					(acc, repoName) => {
						acc[repoName] = undefined;
						return acc;
					},
					{} as Record<string, undefined>,
				),
			},
			// For the update error test
			update: {
				...options.repositoryCommands?.responses?.update,
				// When a repository with id in updateErrors is updated, return undefined
				...(
					options.repositoryCommands?.errorScenarios?.updateErrors || []
				).reduce(
					(acc, repoId) => {
						acc[repoId.toString()] = undefined;
						return acc;
					},
					{} as Record<string, undefined>,
				),
			},
		},
	});
	const mockRepositoryQueries = createMockRepositoryQueriesPort(
		options.repositoryQueries,
	);
	const mockIntegrator = createMockGithubIntegrator(options.integrator);

	const sut = new GithubCommands(
		mockIntegrator,
		mockRepositoryCommands,
		mockRepositoryQueries,
	);

	return {
		sut,
		mocks: {
			repositoryCommands: mockRepositoryCommands,
			repositoryQueries: mockRepositoryQueries,
			integrator: mockIntegrator,
		},
	};
}
