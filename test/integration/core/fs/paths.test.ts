import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { ensurePath, getUniquePath, pathExists } from "@/core/fs/paths";

import { IntegrationTestHelper } from "test/helpers/integration";

describe("File System Path Operations", () => {
  let helper: IntegrationTestHelper;
  let testPath: string;

  beforeAll(async () => {
    helper = new IntegrationTestHelper("path-operations");
    await helper.beforeAll();
  });

  beforeEach(async () => {
    testPath = await helper.createTestCaseDir("test-case");
  });

  afterAll(async () => {
    await helper.afterAll();
  });

  describe("ensurePath", () => {
    it("should create nested directories", async () => {
      const nestedPath = join(testPath, "deep", "nested", "path");
      await ensurePath(nestedPath);
      const exists = await pathExists(nestedPath);
      expect(exists).toBe(true);
    });

    it("should handle existing directories", async () => {
      const dirPath = join(testPath, "existing");
      await ensurePath(dirPath);
      await ensurePath(dirPath); // Second call should not throw
      const exists = await pathExists(dirPath);
      expect(exists).toBe(true);
    });
  });

  describe("getUniquePath", () => {
    it("should generate unique path when file exists", async () => {
      const basePath = join(testPath, "test-file.txt");
      await ensurePath(join(testPath)); // Ensure parent directory exists
      await writeFile(basePath, "content");

      const uniquePath = await getUniquePath(basePath);
      expect(uniquePath).not.toBe(basePath);
      expect(uniquePath).toMatch(/test-file-\d+\.txt$/);
    });

    it("should return original path when file doesn't exist", async () => {
      const basePath = join(testPath, "non-existent.txt");
      const uniquePath = await getUniquePath(basePath);
      expect(uniquePath).toBe(basePath);
    });
  });

  describe("pathExists", () => {
    it("should return true for existing paths", async () => {
      const filePath = join(testPath, "exists.txt");
      await ensurePath(join(testPath)); // Ensure parent directory exists
      await writeFile(filePath, "content");

      const exists = await pathExists(filePath);
      expect(exists).toBe(true);
    });

    it("should return false for non-existent paths", async () => {
      const filePath = join(testPath, "does-not-exist.txt");
      const exists = await pathExists(filePath);
      expect(exists).toBe(false);
    });
  });
});
