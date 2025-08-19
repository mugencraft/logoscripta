import type { GithubRepository } from "@/shared/github/types";

import type { Repository } from "../../../models/github/repository";

export interface RepositoryCommandsPort {
  create: (data: GithubRepository) => Promise<Repository | undefined>;
  update: (
    id: number,
    data: GithubRepository,
  ) => Promise<Repository | undefined>;
}
