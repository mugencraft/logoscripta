import { join } from "node:path";
import { ChangeTracker } from "@/core/changes/tracker";
import type { Change } from "@/core/changes/types";
import { readJson } from "@/core/serialization/json";
import { sampleChangeDetectorConfig } from "test/fixtures/entities/changes";
import {
	type SampleTestEntity,
	createTestEntity,
} from "test/fixtures/entities/test-entity";
import { IntegrationTestHelper } from "test/helpers/integration";
import { setupTestTime } from "test/helpers/time";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("ChangeTracker Integration", () => {
	let sut: ChangeTracker<SampleTestEntity>;
	let helper: IntegrationTestHelper;
	let changelogPath: string;

	beforeAll(async () => {
		helper = new IntegrationTestHelper("change-tracker");
		await helper.beforeAll();
	});

	beforeEach(async () => {
		const testPath = await helper.createTestCaseDir("test-case");
		changelogPath = join(testPath, "changelog.json");

		sut = new ChangeTracker<SampleTestEntity>(
			sampleChangeDetectorConfig,
			"test-entity",
			changelogPath,
		);

		setupTestTime();
	});

	afterAll(async () => {
		await helper.afterAll();
	});

	describe("Change Tracking", () => {
		it("should store full changes in changelog", async () => {
			const previous = createTestEntity();
			const current = createTestEntity({ name: "Updated Name" });

			const changes = await sut.trackChanges(current, previous);

			// Verify changes returned
			expect(changes).toHaveLength(1);
			expect(changes?.[0]).toMatchObject({
				type: "full",
				data: current,
				timestamp: "2024-01-01T00:00:00.000Z",
			});

			// Verify changelog file contents
			const storedChanges =
				await readJson<Change<SampleTestEntity>[]>(changelogPath);
			expect(storedChanges).toHaveLength(1);
			expect(storedChanges[0]).toEqual(changes?.[0]);
		});

		it("should store soft changes in changelog", async () => {
			const previous = createTestEntity();
			const current = createTestEntity({
				metadata: { ...previous.metadata, views: 200 },
			});

			const changes = await sut.trackChanges(current, previous);

			// Verify changes returned
			expect(changes).toHaveLength(1);
			expect(changes?.[0]).toMatchObject({
				type: "soft",
				data: current,
			});

			// Verify changelog file contents
			const storedChanges =
				await readJson<Change<SampleTestEntity>[]>(changelogPath);
			expect(storedChanges).toHaveLength(1);
			expect(storedChanges[0]).toEqual(changes?.[0]);
		});

		it("should append multiple changes sequentially", async () => {
			const entities = [
				createTestEntity({ id: "test-1" }),
				createTestEntity({ id: "test-2", name: "Second Entity" }),
				createTestEntity({ id: "test-3", name: "Third Entity" }),
			];

			// Track changes sequentially
			for (let i = 1; i < entities.length; i++) {
				const changes = await sut.trackChanges(
					entities[i] as SampleTestEntity,
					entities[i - 1] as SampleTestEntity,
				);
				expect(changes).toHaveLength(1);
			}

			// Verify final changelog state
			const storedChanges =
				await readJson<Change<SampleTestEntity>[]>(changelogPath);
			expect(storedChanges).toHaveLength(2);
			expect(storedChanges.map((c) => c.id)).toEqual(["test-2", "test-3"]);
		});

		it("should handle concurrent change tracking", async () => {
			const previous = createTestEntity();
			const changes = Array.from({ length: 5 }, (_, i) =>
				createTestEntity({
					name: `Concurrent Change ${i}`,
					metadata: { ...previous.metadata, views: 100 + i },
				}),
			);

			// Track changes concurrently
			await Promise.all(
				changes.map((current) => sut.trackChanges(current, previous)),
			);

			// Verify changes were stored correctly
			const storedChanges =
				await readJson<Change<SampleTestEntity>[]>(changelogPath);
			expect(storedChanges).toHaveLength(5);
			expect(storedChanges.every((c) => c.type === "full")).toBe(true);
		});
	});

	describe("Error Handling", () => {
		it("should throw error when changelog path not provided", async () => {
			const tracker = new ChangeTracker<SampleTestEntity>(
				sampleChangeDetectorConfig,
				"test-entity",
			);

			await expect(
				tracker.trackChanges(createTestEntity(), createTestEntity()),
			).rejects.toThrow("Changelog path not provided");
		});
	});
});
