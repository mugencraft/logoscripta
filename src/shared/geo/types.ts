export interface AdministrativeRecord {
  code: string;
  name: string;
  level: number;
  parentCode?: string;
  countryCode?: string;
  metadata: Record<string, string>;
}
