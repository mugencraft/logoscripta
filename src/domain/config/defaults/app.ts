import type { AppConfig } from "../app";

export const DEFAULT_APP_CONFIG: AppConfig = {
  logging: {
    level: "info",
  },
  paths: {
    db: "./data/db",
    config: "./.config",
    github: "./data/github",
    obsidian: "./data/obsidian",
  },
};
