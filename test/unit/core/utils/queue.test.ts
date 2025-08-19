import { beforeEach, describe, expect, it } from "vitest";

import { AsyncQueue } from "@/core/utils/queue";

describe("AsyncQueue Stress Testing", () => {
  let sut: AsyncQueue;

  beforeEach(() => {
    sut = new AsyncQueue();
  });

  describe("concurrent operations", () => {
    it("should handle multiple rapid sequential operations", async () => {
      const results: number[] = [];
      const operations = Array.from({ length: 100 }, (_, i) => i);

      await Promise.all(
        operations.map((i) =>
          sut.add(async () => {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.random() * 10),
            );
            results.push(i);
          }),
        ),
      );

      // Verify operations were executed in order
      expect(results).toEqual(operations);
    });

    it("should maintain order with mixed timing operations", async () => {
      const results: number[] = [];

      // Mix of fast and slow operations
      await Promise.all([
        sut.add(async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          results.push(1);
        }),
        sut.add(async () => {
          results.push(2);
        }),
        sut.add(async () => {
          await new Promise((resolve) => setTimeout(resolve, 25));
          results.push(3);
        }),
      ]);

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe("error handling under load", () => {
    it("should handle errors without breaking the queue", async () => {
      const results: string[] = [];

      const operations = [
        async () => {
          results.push("success1");
        },
        async () => {
          throw new Error("planned failure");
        },
        async () => {
          results.push("success2");
        },
      ];

      await Promise.allSettled(operations.map((op) => sut.add(op)));

      expect(results).toEqual(["success1", "success2"]);
    });

    it("should process remaining tasks after error", async () => {
      let processed = 0;
      const totalTasks = 50;

      const tasks = Array.from({ length: totalTasks }, (_, i) =>
        sut.add(async () => {
          if (i === 25) throw new Error("Simulated failure");
          processed++;
        }),
      );

      await Promise.allSettled(tasks);
      expect(processed).toBe(totalTasks - 1);
    });
  });

  describe("performance characteristics", () => {
    it("should handle large numbers of operations efficiently", async () => {
      const startTime = Date.now();
      const operationCount = 1000;
      const operations = Array.from({ length: operationCount }, () =>
        sut.add(async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
        }),
      );

      await Promise.all(operations);
      const duration = Date.now() - startTime;

      // Operations should complete in reasonable time
      expect(duration).toBeLessThan(operationCount * 2);
    });
  });
});
