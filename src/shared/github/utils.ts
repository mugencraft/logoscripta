type RepoParams = {
	owner: string;
	repo: string;
};

export function parseGithubRepoToString(repoString?: string): string {
	const { owner, repo } = parseGithubRepo(repoString);
	return `${owner}/${repo}`;
}

export function parseGithubRepoToIdentifier(repoString?: string): string {
	const { owner, repo } = parseGithubRepo(repoString);
	return `${owner}_${repo}`;
}

/**
 * Parses a GitHub repository string into an object containing owner and repo.
 * Throws an error if the string is invalid.
 *
 * @param repoString - Repository string
 * @returns Parsed repository object
 */
export function parseGithubRepo(repoString?: string): RepoParams {
	try {
		const normalized = normalizeGithubUrl(repoString);
		const segments = normalized.split("/").filter(Boolean);
		return validateRepoSegments(segments);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : `Unknown error: ${error}`;
		throw new Error(
			`Invalid repository string '${repoString}': ${errorMessage}`,
		);
	}
}

/**
 * Normalizes a GitHub repository URL by removing any trailing slashes.
 * Handles URLs with and without protocol, and URLs with a trailing slash.
 *
 * @param url - Repository URL
 * @returns Normalized repository URL
 */
function normalizeGithubUrl(url?: string): string {
	if (!url) {
		throw new Error("Repository string cannot be empty");
	}
	const trimmed = url.trim();
	let normalized: string | undefined;

	if (trimmed.includes("://")) {
		const urlObject = new URL(trimmed);
		if (!urlObject.hostname.includes("github.com")) {
			throw new Error("Not a GitHub URL");
		}
		normalized = urlObject.pathname
			.replace(/\.git$/, "")
			.replace(/^\/+|\/+$/g, "")
			.split(/[?#]/)[0];
	} else {
		normalized = trimmed.replace(/^\/+|\/+$/g, "").split(/[?#]/)[0];
	}

	if (!normalized) {
		throw new Error("Repository string cannot be empty");
	}

	return normalized;
}

/**
 * Validates the segments of a GitHub repository string.
 * Throws an error if the segments are invalid.
 *
 * @param segments - Repository segments
 * @returns Parsed repository object
 */
function validateRepoSegments(segments: string[]): RepoParams {
	if (segments.length < 2) {
		throw new Error('Invalid repository string format. Expected "owner/repo"');
	}

	const [owner, repo] = segments;
	if (!owner || !/^[\w.-]+$/.test(owner) || !repo || !/^[\w.-]+$/.test(repo)) {
		throw new Error("Invalid characters in repository string");
	}

	return { owner, repo };
}
