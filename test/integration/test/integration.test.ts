import { readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IntegrationTestHelper } from "test/helpers/integration";
import { beforeEach, describe, expect, it } from "vitest";

describe("IntegrationTestHelper", () => {
	describe("initialization", () => {
		it("should require a test suite name", () => {
			expect(() => new IntegrationTestHelper("")).toThrow(
				"Test suite name is required",
			);
		});

		it("should create paths within system temp directory", () => {
			const helper = new IntegrationTestHelper("test-suite");
			const path = helper.getTestPath();
			expect(path.startsWith(tmpdir())).toBe(true);
			expect(path).toContain("logoscripta-tests");
		});

		it("should sanitize test suite names", () => {
			const helper = new IntegrationTestHelper("Test Suite! @#$%");
			const path = helper.getTestPath();
			expect(path).toMatch(/test-suite/);
			expect(path).not.toMatch(/[!@#$%]/);
		});
	});

	describe("path validation", () => {
		it("should prevent paths with parent directory traversal", () => {
			const helper = new IntegrationTestHelper("test");
			const testFn = () => helper.getTestPath("../../../etc");
			expect(testFn).toThrow(
				"Test directory must be within the logoscripta-tests directory",
			);
		});

		it("should prevent absolute paths outside test directory", () => {
			const helper = new IntegrationTestHelper("test");
			// Use a partial path that could be dangerous if resolved incorrectly
			const testFn = () => helper.getTestPath("/etc");
			expect(testFn).toThrow(
				"Test directory must be within the logoscripta-tests directory",
			);
		});

		it("should allow valid subdirectories", () => {
			const helper = new IntegrationTestHelper("test");
			const testFn = () => helper.getTestPath("subdir/test.txt");
			expect(testFn).not.toThrow();
		});
	});

	describe("directory management", () => {
		describe("beforeAll and afterAll", () => {
			it("should create and clean test directories", async () => {
				const helper = new IntegrationTestHelper("test-cleanup");
				await helper.beforeAll();
				const testPath = helper.getTestPath();

				// Create test content
				await writeFile(join(testPath, "test.txt"), "test");
				const files = await readdir(testPath);
				expect(files).toContain("test.txt");

				// Clean up
				await helper.afterAll();
				await expect(readdir(testPath)).rejects.toThrow();
			});

			it("should handle missing directory in afterAll", async () => {
				const helper = new IntegrationTestHelper("test-missing");
				// Don't call beforeAll, just try to clean up
				await expect(helper.afterAll()).resolves.not.toThrow();
			});
		});

		describe("createTestCaseDir", () => {
			let helper: IntegrationTestHelper;

			beforeEach(async () => {
				helper = new IntegrationTestHelper("test-cases");
				await helper.beforeAll();
			});

			it("should create isolated test case directories", async () => {
				const testPath1 = await helper.createTestCaseDir("test1");
				const testPath2 = await helper.createTestCaseDir("test2");

				expect(testPath1).not.toBe(testPath2);

				// Create file in test1
				await writeFile(join(testPath1, "file1.txt"), "test1");
				const files1 = await readdir(testPath1);
				const files2 = await readdir(testPath2);

				expect(files1).toContain("file1.txt");
				expect(files2).not.toContain("file1.txt");
			});

			it("should clean directory on each call", async () => {
				const testPath = await helper.createTestCaseDir("test");
				await writeFile(join(testPath, "first.txt"), "first");

				// Create same directory again
				const samePath = await helper.createTestCaseDir("test");
				const files = await readdir(samePath);

				expect(files).not.toContain("first.txt");
				expect(testPath).toBe(samePath);
			});

			it("should handle deep directory structures", async () => {
				const testPath = await helper.createTestCaseDir("deep/nested/test");
				await writeFile(join(testPath, "deep.txt"), "test");

				const files = await readdir(testPath);
				expect(files).toContain("deep.txt");
			});

			it("should handle special characters in test names", async () => {
				const testPath = await helper.createTestCaseDir("test!@#$%^&*()");
				await writeFile(join(testPath, "test.txt"), "test");

				const files = await readdir(testPath);
				expect(files).toContain("test.txt");
			});

			it("should preserve parent directory on cleanup", async () => {
				const parentPath = await helper.createTestCaseDir("parent");
				const childPath = await helper.createTestCaseDir("parent/child");

				// Create files in both directories
				await writeFile(join(parentPath, "parent.txt"), "parent");
				await writeFile(join(childPath, "child.txt"), "child");

				// Create child directory again
				await helper.createTestCaseDir("parent/child");

				// Parent file should still exist
				const parentFiles = await readdir(parentPath);
				expect(parentFiles).toContain("parent.txt");
			});
		});
	});
});
