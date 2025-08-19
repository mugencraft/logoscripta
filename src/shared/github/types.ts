import type { Endpoints } from "@octokit/types";

// For getRepository response
export type GetRepoResponse =
  Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];

// For getFile response
export type GetContentsResponse =
  Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"]["data"];

export type GithubFileContent = Extract<GetContentsResponse, { type: "file" }>;

// For search response
export type SearchResponse =
  Endpoints["GET /search/repositories"]["response"]["data"];
export type SearchRepositoryItem = SearchResponse["items"][number];

// For repository
export type GithubRepository =
  Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];

// export type GithubLicense = NonNullable<GithubRepository["license"]>;
// export type GithubOwner = NonNullable<GithubRepository["owner"]>;
