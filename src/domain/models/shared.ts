export const SYSTEM_TYPE_SYMBOL = Symbol("systemType");

// Enums

export const RECORD_STATUS = [
  "new",
  "reviewing",
  "active",
  "archived",
  "favorite",
] as const;

export const IMPORT_SOURCES = [
  "manual",
  "import",
  "sync",
  "api",
  "url",
] as const;
