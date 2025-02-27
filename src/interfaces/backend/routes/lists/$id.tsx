import { isSystemListType } from "@/domain/models/repository-list";
import { type List, trpcBase } from "@/interfaces/server-client";
import { RouteErrorComponent } from "@/ui/components/extra/errors";
import { createFileRoute } from "@tanstack/react-router";
import { ListView } from "../../views/ListView";

export const Route = createFileRoute("/lists/$id")({
	loader: async ({ params }) => {
		const list = await getList(params.id);
		const items = await trpcBase.list.getItems.query(list.id);

		return { list, items };
	},
	component: ListView,
	errorComponent: RouteErrorComponent,
});

const getList = async (sourceType: string) => {
	let list: List;
	if (isSystemListType(sourceType)) {
		list = await trpcBase.list.getSystemList.query(sourceType);
		if (!list) throw new Error(`System list not found: ${sourceType}`);
	} else {
		// Otherwise treat as custom list ID
		const listId = Number.parseInt(sourceType);
		if (Number.isNaN(listId)) throw new Error("Invalid list ID");

		list = await trpcBase.list.getById.query(listId);
		if (!list) throw new Error(`List ${listId} not found`);
	}
	return list;
};
