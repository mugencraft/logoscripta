import { router } from "../trpc";
import { listRouter } from "./list";
import { repositoryRouter } from "./repository";

export const appRouter = router({
	repository: repositoryRouter,
	list: listRouter,
});
