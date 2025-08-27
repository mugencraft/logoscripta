import { ConsoleLogger } from "../logging/logger";

export interface FetchWithRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryCondition?: (response: Response) => boolean;
}

export const fetchWithRetry = async (
  url: string,
  requestInit?: RequestInit,
  options: FetchWithRetryOptions = {},
): Promise<Response> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryCondition = (response) => !response.ok && response.status >= 500,
  } = options;

  const logger = ConsoleLogger.getInstance();
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, requestInit);

      if (response.ok || !retryCondition(response)) {
        return response;
      }

      if (attempt === maxRetries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
      logger.info(
        `Request failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        logger.error(
          `Request failed after ${maxRetries} attempts: ${lastError.message}`,
        );
        throw lastError;
      }

      const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
      logger.info(
        `Request error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // biome-ignore lint/style/noNonNullAssertion: check this
  throw lastError!;
};
