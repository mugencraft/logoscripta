import { router } from "../../trpc";
import { taxonomyAssignmentRouter } from "./assignments";
import { taxonomySystemRouter } from "./systems";
import { taxonomyTopicRouter } from "./topics";

export const taxonomyRouter = router({
  systems: taxonomySystemRouter,
  topics: taxonomyTopicRouter,
  assignments: taxonomyAssignmentRouter,
});
