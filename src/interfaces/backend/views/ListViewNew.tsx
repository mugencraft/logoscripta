import { ViewContainer } from "@/ui/components/layout/ViewContainer";
import { NewListForm } from "../components/NewListForm";

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
