/**
 * Error thrown when the GitHub API rate limit is exceeded.
 */
export class GitHubRateLimitError extends Error {
	constructor(message = "GitHub API rate limit reached") {
		super(message);
		this.name = "GitHubRateLimitError";
	}
}

/**
 * Error thrown when the GitHub API returns an error response.
 */
export class GitHubAPIError extends Error {
	constructor(
		message: string,
		public readonly statusCode?: number,
		public readonly response?: unknown,
	) {
		super(message);
		this.name = "GitHubAPIError";
	}
}
