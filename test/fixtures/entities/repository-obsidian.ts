import { sampleRepository } from "./repository";

export const sampleObsidianRepositories = {
  "test/obsidian-plugin-repo": {
    ...sampleRepository,
    fullName: "test/obsidian-plugin-repo",
  },
  "test/obsidian-theme-repo": {
    ...sampleRepository,
    fullName: "test/obsidian-theme-repo",
  },
} as const;
