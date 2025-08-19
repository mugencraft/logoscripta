export const getValueAtPath = <T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  path: string,
): T | undefined => {
  if (!path.includes(".")) {
    return obj?.[path] as T;
  }

  // Path nested: split e reduce
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown) as T | undefined;
};
