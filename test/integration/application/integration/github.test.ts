import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { GithubIntegrator } from "@/application/integration/github";
import type { Change } from "@/core/changes/types";
import { pathExists } from "@/core/fs/paths";
import { readJson } from "@/core/serialization/json";
import { githubRepositoryConfig } from "@/domain/config/defaults/change.github";
import type { GithubRepository } from "@/shared/github/types";
import { sampleGithubRepository } from "test/fixtures/api-responses/github";
import { IntegrationTestHelper } from "test/helpers/integration";
import { setupTestTime } from "test/helpers/time";
import {
	type MockGithubAdapterOptions,
	createMockGithubAdapter,
} from "test/mocks/infrastructure/adapters.github";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("GithubIntegrator Integration", () => {
	let helper: IntegrationTestHelper;
	let testPath: string;

	beforeAll(async () => {
		helper = new IntegrationTestHelper("github-integrator");
		await helper.beforeAll();
	});

	beforeEach(async () => {
		testPath = await helper.createTestCaseDir("test-case");
		setupTestTime();
	});

	afterAll(async () => {
		await helper.afterAll();
	});

	describe("Repository History Management", () => {
		it("should properly store initial repository state", async () => {
			const { sut, paths } = createTestSetup(testPath);
			const result = await sut.fetchRepository("test/repo");

			// Verify API response transformation
			expect(result).toEqual(sampleGithubRepository);

			// Verify snapshot storage
			const repoPath = paths.getRepoPath("test/repo");
			const snapshotPath = join(repoPath, "2024-01-01.json");

			expect(await pathExists(repoPath)).toBe(true);
			const snapshot = await readJson<GithubRepository>(snapshotPath);
			expect(snapshot).toEqual(sampleGithubRepository);
		});

		it("should track meaningful repository changes", async () => {
			const initial = createTestSetup(testPath);
			// Create initial state
			await initial.sut.fetchRepository("test/repo");

			// Setup modified data
			const { sut, paths } = createTestSetup(testPath, {
				customRepositories: {
					"test/repo": {
						...sampleGithubRepository,
						description: "Updated description",
						topics: ["new-topic"],
					},
				},
			});

			// Force update to trigger change detection
			setupTestTime("2024-01-02");
			await sut.fetchRepository("test/repo", { forceFetch: true });

			// Verify changes were tracked
			const changelogPath = join(
				paths.getRepoPath("test/repo"),
				"changelog.json",
			);
			const changes = await readJson<Change<GithubRepository>[]>(changelogPath);

			expect(changes).toHaveLength(2);
			expect(changes[0]).toMatchObject({
				type: "add",
				data: expect.objectContaining({
					description: "Test repository",
				}),
			});
			expect(changes[1]).toMatchObject({
				type: "full",
				data: expect.objectContaining({
					description: "Updated description",
					topics: ["new-topic"],
				}),
			});
		});

		it("should detect and track soft changes", async () => {
			const initial = createTestSetup(testPath);
			await initial.sut.fetchRepository("test/repo");

			// Setup data with only soft changes
			const { sut, paths } = createTestSetup(testPath, {
				customRepositories: {
					"test/repo": {
						...sampleGithubRepository,
						stargazers_count: 200,
					},
				},
			});

			setupTestTime("2024-01-02");
			await sut.fetchRepository("test/repo", { forceFetch: true });

			const changelogPath = join(
				paths.getRepoPath("test/repo"),
				"changelog.json",
			);
			const changes = await readJson<Change<GithubRepository>[]>(changelogPath);

			expect(changes[1]).toMatchObject({
				type: "soft",
				data: expect.objectContaining({
					stargazers_count: 200,
				}),
			});
		});

		it("should maintain snapshot history with retention policy", async () => {
			const { sut, paths } = createTestSetup(testPath);
			// Create multiple snapshots over time
			const dates = ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"];
			for (const date of dates) {
				setupTestTime(date);
				await sut.fetchRepository("test/repo", { forceFetch: true });
			}

			const repoPath = paths.getRepoPath("test/repo");
			const snapshots = (await readdir(repoPath))
				.filter((file) => file.match(/^\d{4}-\d{2}-\d{2}\.json$/))
				.sort();

			// Verify retention of only the latest snapshots (retention: 2)
			expect(snapshots).toEqual(["2024-01-03.json", "2024-01-04.json"]);
		});
	});

	describe("Error Handling and Recovery", () => {
		describe("API Error Handling", () => {
			it("should handle API errors while preserving history", async () => {
				const initial = createTestSetup(testPath);
				// Create initial state
				await initial.sut.fetchRepository("test/repo");

				// Setup error scenario
				const { sut, paths } = createTestSetup(testPath, {
					errorScenarios: {
						repositoryErrors: ["test/repo"],
					},
				});

				// Verify error is thrown but history is preserved
				await expect(
					sut.fetchRepository("test/repo", { forceFetch: true }),
				).rejects.toThrow(/GitHub API error/);

				const snapshotPath = join(
					paths.getRepoPath("test/repo"),
					"2024-01-01.json",
				);
				const snapshot = await readJson<GithubRepository>(snapshotPath);
				expect(snapshot).toEqual(sampleGithubRepository);
			});

			it("should handle rate limit errors appropriately", async () => {
				const { sut } = createTestSetup(testPath, {
					errorScenarios: {
						apiErrors: ["test/repo"],
					},
				});

				await expect(sut.fetchRepository("test/repo")).rejects.toThrow(
					/API rate limit exceeded/,
				);
			});
		});

		describe("Cache Behavior", () => {
			it("should use cached data when available and not forced", async () => {
				const { sut, mocks } = createTestSetup(testPath);
				// Initial fetch to populate cache
				await sut.fetchRepository("test/repo");

				// Subsequent fetch should use cache
				const result = await sut.fetchRepository("test/repo");
				expect(result).toEqual(sampleGithubRepository);
				expect(mocks.adapter.getRepository).toHaveBeenCalledTimes(1);
			});

			it("should bypass cache when force refresh is requested", async () => {
				const { sut, mocks } = createTestSetup(testPath);
				await sut.fetchRepository("test/repo");
				await sut.fetchRepository("test/repo", { forceFetch: true });

				expect(mocks.adapter.getRepository).toHaveBeenCalledTimes(2);
			});
		});
	});
});

function createTestSetup(
	testPath: string,
	options: MockGithubAdapterOptions = {},
) {
	const mockAdapter = createMockGithubAdapter(options);

	const sut = new GithubIntegrator(mockAdapter, {
		paths: {
			github: testPath,
			obsidian: testPath,
		},
		changeConfig: githubRepositoryConfig,
		snapshotRetention: 2,
	});

	return {
		sut,
		mocks: {
			adapter: mockAdapter,
		},
		paths: {
			base: testPath,
			getRepoPath: (repo: string) => {
				// Fix: Match the same path construction logic from GithubIntegrator
				const [owner, repoName] = repo.split("/");
				if (!owner || !repoName) return "";
				return join(
					testPath,
					"repos",
					owner?.toLowerCase()[0] || "_",
					`${owner}_${repoName}`,
				);
			},
		},
	};
}
