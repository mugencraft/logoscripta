import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { HistoryService } from "@/core/changes/history";
import type { HistoryOptions } from "@/core/changes/types";
import { readJson } from "@/core/serialization/json";

import { sampleChangeDetectorConfig } from "test/fixtures/entities/changes";
import {
  createTestEntity,
  type SampleTestEntity,
} from "test/fixtures/entities/test-entity";
import { IntegrationTestHelper } from "test/helpers/integration";
import { setupTestTime } from "test/helpers/time";

const entityIdentifier = "test-entity";

const defaultOptions: HistoryOptions = {
  basePath: "",
  entityType: entityIdentifier,
  changeConfig: sampleChangeDetectorConfig,
  useEntityFolder: false,
  snapshotRetention: 2,
};

describe("HistoryService Integration", () => {
  let sut: HistoryService<SampleTestEntity>;
  let helper: IntegrationTestHelper;
  let entityBasePath: string;

  beforeAll(async () => {
    helper = new IntegrationTestHelper("history-test");
    await helper.beforeAll();
  });

  beforeEach(async () => {
    const testPath = await helper.createTestCaseDir("test-case");
    entityBasePath = join(testPath, "entities");
    sut = new HistoryService<SampleTestEntity>({
      ...defaultOptions,
      basePath: entityBasePath,
    });

    setupTestTime();
  });

  afterAll(async () => {
    await helper.afterAll();
  });

  describe("trackChanges", () => {
    it("should create initial snapshot without changes when no previous state exists", async () => {
      const current = createTestEntity();
      const result = await sut.trackChanges(entityIdentifier, current);

      expect(result.identifier).toBe(entityIdentifier);
      expect(result.snapshot.type).toBe("created");
      expect(result.changes).toHaveLength(1);

      // Verify the snapshot was saved correctly
      const snapshotData = await readJson(result.snapshot.path);
      expect(snapshotData).toEqual(current);

      // Verify the path structure
      expect(result.snapshot.path).toContain(
        join(entityBasePath, entityIdentifier),
      );
    });

    it("should track full changes when entity is updated", async () => {
      const previous = createTestEntity();
      const current = createTestEntity({ name: "Updated Name" });

      // First create initial snapshot
      await sut.trackChanges(entityIdentifier, previous);

      // Then track changes
      const result = await sut.trackChanges(
        entityIdentifier,
        current,
        previous,
      );

      expect(result.changes).toBeDefined();
      // @ts-expect-error - change should be set
      expect(result.changes[0].type).toBe("full");
      // @ts-expect-error - change should be set
      expect(result.changes[0].data).toEqual(current);

      // Verify changelog was created
      const changelogPath = join(
        entityBasePath,
        entityIdentifier,
        "changelog.json",
      );
      const changes = await readJson(changelogPath);
      expect(Array.isArray(changes)).toBe(true);
      expect(changes).toHaveLength(2);
    });

    it("should handle soft changes correctly", async () => {
      const previous = createTestEntity();
      const current = createTestEntity({
        metadata: { ...previous.metadata, views: 200 },
      });

      // Create initial snapshot
      await sut.trackChanges(entityIdentifier, previous);

      // Advance time to next day to ensure we get a new snapshot
      setupTestTime("2024-01-02");

      const result = await sut.trackChanges(
        entityIdentifier,
        current,
        previous,
      );

      // @ts-expect-error - change should be set
      expect(result.changes[0].type).toBe("soft");
      expect(result.snapshot.type).toBe("updated");
    });

    it("should respect snapshot retention settings", async () => {
      const entities = [
        createTestEntity({ id: "test-1" }),
        createTestEntity({ id: "test-2" }),
        createTestEntity({ id: "test-3" }),
      ];

      // Create snapshots over multiple days
      for (let i = 0; i < entities.length; i++) {
        setupTestTime(`2024-01-0${i + 1}`);
        await sut.trackChanges(
          entityIdentifier,
          entities[i] as SampleTestEntity,
        );
      }

      // With retention of 2, only the last two snapshots should exist
      const entityPath = join(entityBasePath, entityIdentifier);
      const files = await readdir(entityPath);

      // Filter for valid snapshot files (YYYY-MM-DD.json)
      const snapshotFiles = files
        .filter((file) => {
          const match = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
          return match !== null;
        })
        .sort();

      expect(snapshotFiles).toHaveLength(2);
      expect(snapshotFiles).toEqual(["2024-01-02.json", "2024-01-03.json"]);
    });
  });

  describe("getLatestSnapshot", () => {
    it("should return latest snapshot when available", async () => {
      const entity = createTestEntity();
      await sut.trackChanges(entityIdentifier, entity);

      const result = await sut.getLatestSnapshot(entityIdentifier);
      expect(result).toEqual(entity);
    });

    it("should return undefined when no snapshots exist", async () => {
      const result = await sut.getLatestSnapshot(entityIdentifier);
      expect(result).toBeUndefined();
    });
  });

  describe("shouldRefresh", () => {
    it("should return true when no snapshots exist", async () => {
      const result = await sut.shouldRefresh(entityIdentifier);
      expect(result).toBe(true);
    });

    it("should return false when latest snapshot is from today", async () => {
      await sut.trackChanges(entityIdentifier, createTestEntity());
      const result = await sut.shouldRefresh(entityIdentifier);
      expect(result).toBe(false);
    });

    it("should return true when latest snapshot is outdated", async () => {
      await sut.trackChanges(entityIdentifier, createTestEntity());
      setupTestTime("2024-01-02");
      const result = await sut.shouldRefresh(entityIdentifier);
      expect(result).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle invalid entity paths", async () => {
      const invalidIdentifier = "../invalid";
      await expect(
        sut.trackChanges(invalidIdentifier, createTestEntity()),
      ).rejects.toThrow(/path traversal not allowed/);
    });
  });
});
