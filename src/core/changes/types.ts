export type ChangeType = "add" | "full" | "soft" | "removal";

export interface Change<T> {
	id: string;
	timestamp: string;
	type: ChangeType;
	entityType: string;
	data: T;
}

export interface ChangeDetectorConfig {
	idField: string;
	trackedFields: string[];
	updateFields: string[];
	softUpdateFields: string[];
}

export interface ChangeQueryOptions {
	entityType?: string;
	fromDate?: string;
	toDate?: string;
	limit?: number;
	changeTypes?: ChangeType[];
}

export interface SnapshotOptions {
	retainCount?: number;
	force?: boolean;
}

export interface SnapshotPath {
	readonly path: string;
	readonly date: string;
}

export interface HistoryOptions {
	basePath: string;
	entityType: string;
	changeConfig: ChangeDetectorConfig;
	useEntityFolder?: boolean;
	snapshotRetention?: number;
}

export interface SnapshotResult<T> {
	type: "created" | "updated" | "skipped";
	path: string;
	date: string;
	data: T;
	previous?: {
		path: string;
		date: string;
		data: T;
	};
}

export interface HistoryResult<T> {
	identifier: string;
	snapshot: SnapshotResult<T | T[]>;
	changes: Change<T>[] | null;
}
