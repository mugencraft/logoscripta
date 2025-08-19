import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { JsonChangeStore } from "@/core/changes/store";
import type { Change } from "@/core/changes/types";
import { saveFile } from "@/core/fs/save";
import { readJson } from "@/core/serialization/json";

import { createTestChange } from "test/fixtures/entities/changes";
import {
  createComplexTestEntity,
  createTestEntity,
  type SampleComplexTestEntity,
  type SampleTestEntity,
} from "test/fixtures/entities/test-entity";
import { IntegrationTestHelper } from "test/helpers/integration";

describe("JsonChangeStore Integration", () => {
  const sut = new JsonChangeStore<SampleTestEntity>();

  let helper: IntegrationTestHelper;
  let testPath: string;
  let changelogPath: string;

  beforeAll(async () => {
    helper = new IntegrationTestHelper("changes-store");
    await helper.beforeAll();
  });

  beforeEach(async () => {
    testPath = await helper.createTestCaseDir("test-case");
    changelogPath = join(testPath, "changelog.json");
  });

  afterAll(async () => {
    await helper.afterAll();
  });

  describe("append", () => {
    const entity = createTestEntity();
    const change = createTestChange("test-entity", entity);

    // Add test for query with combined filters
    it("should create new changelog when none exists", async () => {
      await sut.append(change, changelogPath);

      const changes = await readJson<Change<SampleTestEntity>[]>(changelogPath);
      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual(change);
    });

    it("should append to existing changelog", async () => {
      const existingEntity = createTestEntity({ id: "existing-1" });
      const newEntity = createTestEntity({ id: "new-1" });

      const existingChange = createTestChange("test-entity", existingEntity);
      const newChange = createTestChange("test-entity", newEntity);

      await sut.append(existingChange, changelogPath);
      await sut.append(newChange, changelogPath);

      const changes = await readJson<Change<SampleTestEntity>[]>(changelogPath);
      expect(changes).toHaveLength(2);
      expect(changes[0]).toEqual(existingChange);
      expect(changes[1]).toEqual(newChange);
    });

    const changes = Array.from(
      { length: 10 },
      (_, i): Change<SampleTestEntity> => {
        const entity = createTestEntity({ id: `test-${i}` });
        return createTestChange("test-entity", entity);
      },
    );

    it("should handle concurrent appends", async () => {
      await Promise.all(
        changes.map(async (change) => await sut.append(change, changelogPath)),
      );

      const stored = await readJson<Change<SampleTestEntity>[]>(changelogPath);
      expect(stored.map((c) => c.id)).toEqual(changes.map((c) => c.id));
      expect(stored).toHaveLength(10);
    });
  });

  describe("query", () => {
    const setupTestChanges = async () => {
      const changes = [
        createTestChange(
          "test-entity",
          createTestEntity({ id: "test-1" }),
          "full",
          "2024-01-01T12:00:00Z",
        ),
        createTestChange(
          "test-entity",
          createTestEntity({ id: "test-2" }),
          "soft",
          "2024-01-02T12:00:00Z",
        ),
        createTestChange(
          "other-entity",
          createTestEntity({ id: "test-3" }),
          "removal",
          "2024-01-03T12:00:00Z",
        ),
      ];

      for (const change of changes) {
        await sut.append(change, changelogPath);
      }

      return changes;
    };

    it("should effectively combine multiple query filters", async () => {
      const result = await sut.query(
        {
          entityType: "test",
          fromDate: "2024-01-01",
          toDate: "2024-01-31",
          changeTypes: ["full", "soft"],
          limit: 5,
        },
        changelogPath,
      );

      expect(result.length).toBeLessThanOrEqual(5);
      expect(result.every((c) => c.entityType === "test")).toBe(true);
      expect(
        result.every(
          (c) =>
            new Date(c.timestamp) >= new Date("2024-01-01") &&
            new Date(c.timestamp) <= new Date("2024-01-31"),
        ),
      ).toBe(true);
      expect(result.every((c) => ["full", "soft"].includes(c.type))).toBe(true);
    });

    it("should return all changes when no filters applied", async () => {
      const changes = await setupTestChanges();
      const result = await sut.query({}, changelogPath);
      expect(result).toEqual(changes);
    });

    it("should filter by entity type", async () => {
      const changes = await setupTestChanges();
      const result = await sut.query(
        { entityType: "test-entity" },
        changelogPath,
      );
      expect(result).toEqual(
        changes.filter((c) => c.entityType === "test-entity"),
      );
    });

    it("should filter by date range", async () => {
      await setupTestChanges();
      const result = await sut.query(
        {
          fromDate: "2024-01-02T00:00:00Z",
          toDate: "2024-01-02T23:59:59Z",
        },
        changelogPath,
      );
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("test-2");
    });

    it("should filter by multiple change types", async () => {
      await setupTestChanges();
      const result = await sut.query(
        {
          changeTypes: ["soft", "removal"],
        },
        changelogPath,
      );
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.type)).toEqual(["soft", "removal"]);
    });

    it("should respect limit parameter", async () => {
      const changes = await setupTestChanges();
      const result = await sut.query({ limit: 2 }, changelogPath);
      expect(result).toHaveLength(2);
      expect(result).toEqual(changes.slice(0, 2));
    });

    it("should effectively combine multiple query filters", async () => {
      const complexEntity = createComplexTestEntity({
        status: "active",
        metadata: { views: 100 },
      });
      const change = createTestChange<SampleComplexTestEntity>(
        "test",
        complexEntity,
      );
      const sut = new JsonChangeStore<SampleComplexTestEntity>();
      await sut.append(change, changelogPath);

      const result = await sut.query(
        {
          entityType: "test",
          fromDate: "2024-01-01",
          toDate: "2024-01-31",
          changeTypes: ["full", "soft"],
          limit: 5,
        },
        changelogPath,
      );

      expect(result.length).toBeLessThanOrEqual(5);
      expect(result.every((c) => c.entityType === "test")).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle non-existent file gracefully in query", async () => {
      const nonExistentPath = join(testPath, "nonexistent", "changelog.json");
      const nonExistentStore = new JsonChangeStore<SampleTestEntity>();

      const result = await nonExistentStore.query({}, nonExistentPath);
      expect(result).toEqual([]);
    });

    it("should handle malformed JSON files", async () => {
      const badFilePath = join(testPath, "malformed", "changelog.json");
      await saveFile(badFilePath, "invalid json content");

      const badStore = new JsonChangeStore<SampleTestEntity>();
      await expect(badStore.query({}, badFilePath)).rejects.toThrow();
    });

    it("should handle file system write errors", async () => {
      const readOnlyPath = join(testPath, "readonly", "changelog.json");
      const readOnlyStore = new JsonChangeStore<SampleTestEntity>();

      const entity = createTestEntity();
      const change = createTestChange("test-entity", entity);

      // Make directory non-writable
      await mkdir(dirname(readOnlyPath), { mode: 0o444 });

      await expect(readOnlyStore.append(change, readOnlyPath)).rejects.toThrow(
        /Failed to read existing changes: .*permission denied/, // <-- Updated error message pattern
      );
    });
  });
});
