// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getListItems = (row: any) => {
	return (
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		row.repositoryListItems?.map((item: any) => ({
			id: item.listId,
			name: item.list.name,
		})) ?? undefined
	);
};
