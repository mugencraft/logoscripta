export interface CategoryItem {
	value: string;
	label: string;
}

export interface CategoryGroup {
	value: string;
	label: string;
	description?: string;
	subitems: string[];
	expanded?: boolean;
}

export interface CategoryOption {
	value: string;
	label: string;
	isSubitem?: boolean;
	parentValue?: string;
	parentLabel?: string;
	description?: string;
}
