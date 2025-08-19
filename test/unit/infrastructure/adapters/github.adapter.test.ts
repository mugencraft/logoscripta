import { beforeEach, describe, expect, it, vi } from "vitest";

import { GithubAdapter } from "@/infrastructure/adapters/github/adapter";
import { GitHubRateLimitError } from "@/infrastructure/adapters/github/error";

describe("GithubAdapter", () => {
  let sut: GithubAdapter;

  beforeEach(() => {
    sut = new GithubAdapter("test-token");
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe("rate limiting", () => {
    it("should handle retry-after header", async () => {
      // Throw the Response instead of resolving with it
      vi.mocked(fetch).mockRejectedValueOnce(
        Object.assign(
          new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
            status: 403,
            headers: new Headers({
              "retry-after": "60",
            }),
          }),
        ),
      );

      await expect(sut.getRepository("test/repo")).rejects.toThrow(
        GitHubRateLimitError,
      );
    });

    it("should handle rate limit reset time", async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 3600;

      vi.mocked(fetch).mockRejectedValueOnce(
        Object.assign(
          new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
            status: 429,
            headers: new Headers({
              "x-ratelimit-reset": resetTime.toString(),
            }),
          }),
        ),
      );

      await expect(sut.getRepository("test/repo")).rejects.toThrow(/Reset at/);
    });
  });

  describe("getFile", () => {
    it("should handle directory response", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify([{ type: "dir" }]), { status: 200 }),
      );

      await expect(sut.getFile("test/repo", "path")).rejects.toThrow(
        "Path points to a directory",
      );
    });

    it("should handle invalid JSON content", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            type: "file",
            content: Buffer.from("invalid json").toString("base64"),
          }),
          { status: 200 },
        ),
      );

      await expect(sut.getFile("test/repo", "path")).rejects.toThrow(
        SyntaxError,
      );
    });
  });
});
