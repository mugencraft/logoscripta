/**
 * A simple queue for managing asynchronous operations sequentially.
 * Ensures tasks are executed one at a time in the order they were added,
 * even when added concurrently.
 *
 * @example
 * const queue = new AsyncQueue();
 *
 * // These will execute sequentially regardless of timing
 * await queue.add(async () => await saveFile("1.txt"));
 * await queue.add(async () => await saveFile("2.txt"));
 *
 * // Even with Promise.all, order is preserved
 * await Promise.all([
 *   queue.add(async () => await task1()),
 *   queue.add(async () => await task2()),
 * ]);
 */
export class AsyncQueue {
  private queue: (() => Promise<void>)[] = [];
  private running = false;

  /**
   * Adds a task to the queue and returns a promise that resolves when the task completes.
   * Tasks are executed in the order they were added.
   * If a task throws an error, it is rejected but does not stop the queue.
   *
   * @param task - An async function to be executed
   * @returns Promise that resolves when the task completes or rejects if it fails
   * @throws Propagates any error thrown by the task
   */
  async add(task: () => Promise<void>) {
    return new Promise<void>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await task();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.processNext();
    });
  }

  private async processNext() {
    if (this.running || this.queue.length === 0) return;

    this.running = true;
    const task = this.queue.shift();

    try {
      if (task) {
        await task();
      }
    } finally {
      this.running = false;
      this.processNext();
    }
  }
}
