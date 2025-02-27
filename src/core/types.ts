type NullableString = string | null;
// export type SQLValue = NullableString | number | boolean;
// export type JsonValue =
// 	| SQLValue
// 	| undefined
// 	| JsonValue[]
// 	| { [key: string]: JsonValue };

export type CSVRecord = Record<string, NullableString>;
// export type SQLRecord = Record<string, SQLValue>;
// export type JsonRecord = Record<string, JsonValue>;
