import type { NewOwner } from "@/domain/models/github/owner";
import type { NewRepository } from "@/domain/models/github/repository";
import type { GithubRepository } from "@/shared/github/types";

export const transformToRepository = (
  githubData: GithubRepository,
): NewRepository => {
  return {
    name: githubData.name,
    fullName: githubData.full_name,
    ownerId: githubData.owner.id,
    description: githubData.description,
    createdAt: new Date(githubData.created_at),
    updatedAt: new Date(githubData.updated_at),
    pushedAt: new Date(githubData.pushed_at),
    homepage: githubData.homepage,
    size: githubData.size,
    stargazersCount: githubData.stargazers_count,
    subscribersCount: githubData.subscribers_count,
    language: githubData.language,
    forksCount: githubData.forks_count,
    openIssuesCount: githubData.open_issues_count,
    licenseName: githubData.license?.name || null,
    topics: githubData.topics,
    visibility: githubData.visibility || "",
    defaultBranch: githubData.default_branch,
    isArchived: githubData.archived,
    isDisabled: githubData.disabled,
    isPrivate: githubData.private,
  };
};

export const transformToOwner = (githubData: GithubRepository): NewOwner => {
  return {
    githubId: githubData.owner.id,
    login: githubData.owner.login,
    type: githubData.owner.type,
    avatarUrl: githubData.owner.avatar_url,
    repoCount: 1,
  };
};
