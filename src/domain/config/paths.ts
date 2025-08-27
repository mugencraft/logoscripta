// these are related to vite.config.ts
const FOLDER_TYPES = ["import", "images", "assets"] as const;

export const FOLDER_PATHS = {
  import: "./data/import",
  images: "./data/images",
  assets: "./data/assets",
  geo: "./data/geo",
} as const;

export const FOLDER_URLS = {
  import: "/cdn/import",
  images: "/cdn/images",
  assets: "/cdn/assets",
} as const;

export type FolderType = (typeof FOLDER_TYPES)[number];

export const buildPublicUrl = (
  type: FolderType,
  relativePath: string,
): string => {
  return `${FOLDER_URLS[type]}/${relativePath}`;
};
