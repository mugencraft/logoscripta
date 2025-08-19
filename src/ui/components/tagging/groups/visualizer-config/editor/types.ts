export interface AvailableTag {
  name: string;
  label: string;
  categoryName: string;
  categoryId: number;
  isOneOfKind: boolean;
}
export type TagsByCategory = Record<
  string,
  { tags: AvailableTag[]; isOneOfKind: boolean }
>;
