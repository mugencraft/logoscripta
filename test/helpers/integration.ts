import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, normalize } from "node:path";

/**
 * Helper class for managing temporary test directories in integration tests.
 * Provides utilities for creating and cleaning test paths while enforcing safety checks.
 */
export class IntegrationTestHelper {
  private readonly basePath: string;
  private readonly testsRoot: string;

  /**
   * Creates a new IntegrationTestHelper instance.
   * @param testSuiteName - Unique identifier for the test suite to prevent path collisions
   */
  constructor(testSuiteName: string) {
    if (!testSuiteName) {
      throw new Error("Test suite name is required");
    }
    this.testsRoot = join(tmpdir(), "logoscripta-tests");
    this.basePath = join(this.testsRoot, this.sanitizeName(testSuiteName));
  }

  /**
   * Creates a test directory path that is guaranteed to be within the temporary directory.
   * @param subPath - Optional subdirectory within the test directory
   * @returns The full path to the test directory
   */
  getTestPath(subPath?: string): string {
    if (!subPath) {
      return this.basePath;
    }

    // If it's an absolute path, it must be under testsRoot
    if (isAbsolute(subPath)) {
      const normalizedPath = normalize(subPath);
      if (!normalizedPath.startsWith(this.testsRoot)) {
        throw new Error(
          "Test directory must be within the logoscripta-tests directory",
        );
      }
      return normalizedPath;
    }

    // For relative paths, join with basePath and then verify
    const fullPath = join(this.basePath, subPath);
    const normalizedPath = normalize(fullPath);

    // Verify the normalized path is still under testsRoot
    if (!normalizedPath.startsWith(this.testsRoot)) {
      throw new Error(
        "Test directory must be within the logoscripta-tests directory",
      );
    }

    return normalizedPath;
  }

  /**
   * Creates the test directory and ensures it's empty.
   * Should be called in beforeAll() of test suites.
   */
  async beforeAll(): Promise<void> {
    await this.ensureCleanDir(this.basePath);
  }

  /**
   * Removes the test directory and all its contents.
   * Should be called in afterAll() of test suites.
   */
  async afterAll(): Promise<void> {
    try {
      await rm(this.basePath, { recursive: true, force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  /**
   * Creates a clean directory for a specific test.
   * Can be used in beforeEach() if tests need isolated directories.
   * @param testName - Name of the specific test
   */
  async createTestCaseDir(testName: string): Promise<string> {
    const testPath = this.getTestPath(this.sanitizeName(testName));
    await this.ensureCleanDir(testPath);
    return testPath;
  }

  /**
   * Ensures a directory exists and is empty.
   * @private
   */
  private async ensureCleanDir(path: string): Promise<void> {
    try {
      await rm(path, { recursive: true, force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
    await mkdir(path, { recursive: true });
  }

  /**
   * Sanitizes a name for use in file paths.
   * @private
   */
  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
}
