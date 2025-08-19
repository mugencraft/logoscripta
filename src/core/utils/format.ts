export const formatSize = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return unitIndex ? `${size.toFixed(1)} ${units[unitIndex]}` : size;
};

export const formatNumber = (value: number) => {
  const formatter = new Intl.NumberFormat("en", { notation: "compact" });

  return formatter.format(value);
};

const normalizePath = (path: string) => path.replace(/\\/g, "/");

export const getFilenameWithoutExt = (filePath: string) => {
  const parts = normalizePath(filePath).split("/");
  const filename = parts.pop() || "";
  return filename.replace(/\.[^/.]+$/, "");
};

export const sanitizeFolderName = (folderName: string): string => {
  // Remove dangerous characters and path traversal
  const sanitized = folderName
    .replace(/[./\\]/g, "") // Remove . / \
    .replace(/[<>:"|?*]/g, "") // Remove not allowed characters
    .trim();

  if (!sanitized) {
    throw new Error("Invalid folder name provided");
  }

  if (sanitized !== folderName) {
    console.warn("⚠️ Folder name was sanitized:", {
      original: folderName,
      sanitized,
    });
  }

  return sanitized;
};

const upperFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const startCase = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .map((word) => upperFirst(word.toLowerCase()))
    .join(" ");
