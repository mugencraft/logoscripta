export const parseTagsFromText = (text: string | null): string[] => {
  return text
    ? text
        .trim()
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
};
