import { NewListForm } from "@/interfaces/backend/forms/NewListForm";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";

export function ListViewNew() {
	return (
		<ViewContainer
			title="Create New List"
			description="Create a new custom list to organize repositories"
		>
			<NewListForm />
		</ViewContainer>
	);
}
