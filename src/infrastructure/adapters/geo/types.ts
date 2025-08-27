export interface AdministrativeParams {
  region?: string;
  countryCode?: string;
  year?: string;
  projection?: string;
  scale?: string;
  maxLevel?: string;
}

export interface AdministrativeDataAdapter {
  readonly name: string;
  fetch(params: AdministrativeParams): Promise<string>;
  getDataPath(params: AdministrativeParams): string;
}

export interface CountryRecord {
  code: string;
  name: string;
  officialName: string;
  region: string;
  subregion?: string;
  metadata: Record<string, unknown>;
}
