import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { SnapshotService } from "@/core/changes/snapshot";
import { readJson, saveJson } from "@/core/serialization/json";

import { IntegrationTestHelper } from "test/helpers/integration";
import { setupTestTime } from "test/helpers/time";

describe("SnapshotService Integration", () => {
  const sut = new SnapshotService();
  const mockData = { id: 1, name: "test" };

  let helper: IntegrationTestHelper;
  let entityPath: string;

  beforeAll(async () => {
    helper = new IntegrationTestHelper("snapshot-test");
    await helper.beforeAll();
  });

  beforeEach(async () => {
    entityPath = await helper.createTestCaseDir("test-entity");

    setupTestTime();
  });

  afterAll(async () => {
    await helper.afterAll();
  });

  async function writeTestSnapshot(date: string, data: unknown): Promise<void> {
    const snapshotPath = join(entityPath, `${date}.json`);
    await saveJson(data, snapshotPath);
  }

  async function readTestSnapshot(date: string): Promise<unknown> {
    const snapshotPath = join(entityPath, `${date}.json`);
    return await readJson(snapshotPath);
  }

  describe("getLatestSnapshot", () => {
    it("should return latest snapshot when available", async () => {
      await writeTestSnapshot("2024-01-01", mockData);

      const result = await sut.getLatestSnapshot(entityPath);
      expect(result).toEqual(mockData);
    });

    it("should return undefined when no snapshots exist", async () => {
      const result = await sut.getLatestSnapshot(entityPath);
      expect(result).toBeUndefined();
    });

    it("should handle invalid entity paths", async () => {
      const invalidPath = "../invalid";
      await expect(sut.getLatestSnapshot(invalidPath)).rejects.toThrow(
        /path traversal not allowed/,
      );
    });
  });

  describe("updateSnapshots", () => {
    it("should create new snapshot with correct result type", async () => {
      const result = await sut.updateSnapshots(entityPath, mockData);

      expect(result.type).toBe("created");
      expect(result.data).toEqual(mockData);
      expect(result.previous).toBeUndefined();

      const savedData = await readTestSnapshot(result.date);
      expect(savedData).toEqual(mockData);
    });

    it("should update existing snapshot with previous data", async () => {
      const previousData = { id: 1, name: "previous" };
      await writeTestSnapshot("2023-12-31", previousData);

      setupTestTime("2024-01-01");
      const result = await sut.updateSnapshots(entityPath, mockData);

      expect(result.type).toBe("updated");
      expect(result.previous).toBeDefined();
      expect(result.previous?.data).toEqual(previousData);
    });

    it("should skip update when snapshot is current", async () => {
      await writeTestSnapshot("2024-01-01", mockData);
      const result = await sut.updateSnapshots(entityPath, mockData);

      expect(result.type).toBe("skipped");
      expect(result.data).toEqual(mockData);
    });

    it("should force update even when snapshot is current", async () => {
      const updatedData = { id: 1, name: "updated" };
      await writeTestSnapshot("2024-01-01", mockData);

      const result = await sut.updateSnapshots(entityPath, updatedData, {
        force: true,
      });

      expect(result.type).toBe("updated");
      expect(result.data).toEqual(updatedData);
    });

    it("should maintain correct retention count", async () => {
      // Create multiple snapshots over different days
      const snapshots = [
        { date: "2024-01-01", data: { id: 1, name: "first" } },
        { date: "2024-01-02", data: { id: 1, name: "second" } },
        { date: "2024-01-03", data: { id: 1, name: "third" } },
      ];

      for (const snapshot of snapshots) {
        setupTestTime(snapshot.date);
        await writeTestSnapshot(snapshot.date, snapshot.data);
      }

      // Add new snapshot with retention of 2
      setupTestTime("2024-01-04");
      await sut.updateSnapshots(
        entityPath,
        { id: 1, name: "fourth" },
        {
          retainCount: 2,
        },
      );

      const latest = await sut.getLatestSnapshot(entityPath);
      const previous = await sut.getPreviousSnapshot(entityPath);

      expect(latest).toEqual({ id: 1, name: "fourth" });
      expect(previous).toEqual({ id: 1, name: "third" });

      // Verify only 2 files exist
      const snapshotFiles = await readdir(entityPath);
      expect(snapshotFiles.length).toBe(2);
    });
  });

  describe("nested entity structures", () => {
    it("should handle nested entity paths correctly", async () => {
      const nestedPath = await helper.createTestCaseDir("nested/entity/path");
      const result = await sut.updateSnapshots(nestedPath, mockData);
      const expectedPath = join(nestedPath, `${result.date}.json`);

      expect(result.path).toBe(expectedPath);

      const savedData = await readJson(result.path);
      expect(savedData).toEqual(mockData);
    });
  });
});
