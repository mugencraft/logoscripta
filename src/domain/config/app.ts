import * as z from "zod";

// Define a single schema for all configuration
export const configSchema = z.object({
  logging: z.object({
    level: z.enum(["error", "warn", "info", "debug"]),
  }),
  paths: z.object({
    db: z.string().min(1),
    config: z.string().min(1),
    github: z.string().min(1),
    obsidian: z.string().min(1),
  }),
  github: z
    .object({
      token: z.string().optional(),
    })
    .optional(),
  google: z
    .object({
      api: z.string().optional(),
    })
    .optional(),
});

// Infer the type from our schema
export type AppConfig = z.infer<typeof configSchema>;
