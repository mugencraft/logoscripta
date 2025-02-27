import type { Repository } from "../../models/repository";

export interface RepositoryQueriesPort {
	findByName(repoString: string): Promise<Repository | undefined>;
	findById(repositoryId: number): Promise<Repository | undefined>;
}
