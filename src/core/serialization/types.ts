import type { SaveOptions } from "../fs/types";

export interface CsvOptions {
  delimiter?: string;
  encoding?: string;
  forceQsv?: boolean;
  noHeaders?: boolean;
  saveOptions?: SaveOptions;
}

export interface CsvParserOptions {
  identifierField: string;
  alternativeFields?: string[];
  transform?: (value: string) => string;
}
