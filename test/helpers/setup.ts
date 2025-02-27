import { afterEach, beforeEach, vi } from "vitest";

// uncomment to enable info logging
// const logger = ConsoleLogger.getInstance({ verbose: true });

// Global test cleanup
beforeEach(() => {
	vi.clearAllMocks(); // Clear mock usage data
	vi.resetAllMocks(); // Reset mock state
	vi.useRealTimers(); // Restore real timers
});

afterEach(() => {
	vi.clearAllMocks(); // Clear mock usage data
	vi.resetAllMocks(); // Reset mock state
	vi.useRealTimers(); // Restore real timers
});
