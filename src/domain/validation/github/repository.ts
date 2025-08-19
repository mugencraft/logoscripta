import * as z from "zod";

// ROUTES

export const repositoryRoutesSchema = {
  search: z.string().min(1).max(100),
  save: z.string(),
};
