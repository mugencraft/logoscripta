import { describe, expect, it } from "vitest";

import {
  parseGithubRepo,
  parseGithubRepoToString,
} from "@/shared/github/utils";

describe("GitHub Repository Utilities", () => {
  describe("parseGithubRepoToString", () => {
    it("should handle simple owner/repo format", () => {
      expect(parseGithubRepoToString("owner/repo")).toBe("owner/repo");
    });

    it("should handle GitHub URLs", () => {
      const urls = [
        "https://github.com/owner/repo",
        "http://github.com/owner/repo",
        "https://github.com/owner/repo.git",
        // Uncomment when we support SSH URLs
        // "git@github.com:owner/repo.git",
      ];

      for (const url of urls) {
        expect(parseGithubRepoToString(url)).toBe("owner/repo");
      }
    });

    it("should handle URLs with trailing slashes", () => {
      expect(parseGithubRepoToString("owner/repo/")).toBe("owner/repo");
      expect(parseGithubRepoToString("https://github.com/owner/repo/")).toBe(
        "owner/repo",
      );
    });

    it("should handle URLs with query parameters and fragments", () => {
      const urls = [
        "https://github.com/owner/repo?foo=bar",
        "https://github.com/owner/repo#readme",
        "https://github.com/owner/repo.git#main",
      ];

      for (const url of urls) {
        expect(parseGithubRepoToString(url)).toBe("owner/repo");
      }
    });

    it("should throw error for invalid inputs", () => {
      const invalidInputs = [
        "",
        " ",
        "invalid",
        "owner",
        "owner/",
        "/repo",
        "https://gitlab.com/owner/repo",
      ];

      for (const input of invalidInputs) {
        expect(() => parseGithubRepoToString(input)).toThrow();
      }
    });
  });

  describe("parseGithubRepo", () => {
    it("should parse simple owner/repo format", () => {
      const result = parseGithubRepo("owner/repo");
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should parse GitHub URLs", () => {
      const result = parseGithubRepo("https://github.com/owner/repo");
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });

    it("should handle repository names with dots and dashes", () => {
      const validRepos = [
        "owner/repo-name",
        "owner/repo.js",
        "owner-name/repo",
        "owner.name/repo-with.dots",
      ];

      for (const repo of validRepos) {
        expect(() => parseGithubRepo(repo)).not.toThrow();
      }
    });

    it("should validate repository name characters", () => {
      const invalidRepos = [
        "owner/repo$name",
        "owner$/repo",
        "owner/repo name",
        "owner name/repo",
        "owner@name/repo",
      ];

      for (const repo of invalidRepos) {
        expect(() => parseGithubRepo(repo)).toThrow(/Invalid characters/);
      }
    });

    it("should handle undefined and empty inputs", () => {
      expect(() => parseGithubRepo(undefined)).toThrow(/cannot be empty/);
      expect(() => parseGithubRepo("")).toThrow(/cannot be empty/);
      expect(() => parseGithubRepo(" ")).toThrow(/cannot be empty/);
    });

    it("should handle malformed GitHub URLs", () => {
      const malformedUrls = [
        "https://github.com/owner",
        "https://github.com/owner/",
        "https://github.com//repo",
        "https://github.com/",
      ];

      for (const url of malformedUrls) {
        expect(() => parseGithubRepo(url)).toThrow();
      }
    });

    it("should reject non-GitHub URLs", () => {
      const nonGithubUrls = [
        "https://gitlab.com/owner/repo",
        "https://bitbucket.org/owner/repo",
      ];

      for (const url of nonGithubUrls) {
        expect(() => parseGithubRepo(url)).toThrow(/Not a GitHub URL/);
      }
    });

    it.todo("should normalize Git SSH URLs", () => {
      const result = parseGithubRepo("git@github.com:owner/repo.git");
      expect(result).toEqual({ owner: "owner", repo: "repo" });
    });
  });
});
