// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getArchiveMetadata = (items: any) => {
	const archivedItem = items.find(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(item: any) =>
			item.metadata?.system?.systemType === "archived" ||
			item.list?.sourceType === "archived",
	);

	return archivedItem?.metadata?.archived;
};
