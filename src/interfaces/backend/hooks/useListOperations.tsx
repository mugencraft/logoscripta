import { trpc } from "@/interfaces/server-client";
import { toast } from "sonner";

export function useListOperations() {
	const createListMutation = trpc.list.create.useMutation({
		onSuccess: () => {
			toast.success("New list has been created successfully.");
		},
		onError: (error) => {
			toast.error(`Error creating list: ${error.message}`);
		},
	});

	const deleteListMutation = trpc.list.delete.useMutation({
		onSuccess: () => {
			toast.success("List has been deleted successfully.");
		},
		onError: (error) => {
			toast.error(`Error deleting list: ${error.message}`);
		},
	});

	const addToListMutation = trpc.list.saveToList.useMutation({
		onSuccess: () => {
			toast.success("Items added to list successfully");
		},
		onError: (error) => {
			toast.error(`Error adding items to list: ${error.message}`);
		},
	});

	const removeFromListMutation = trpc.list.removeFromList.useMutation({
		onSuccess: () => {
			toast.success("Items removed from list successfully");
		},
		onError: (error) => {
			toast.error(`Error removing items from list: ${error.message}`);
		},
	});

	const updateMutation = trpc.list.update.useMutation({
		onSuccess: () => {
			toast.success("List details have been updated successfully.");
		},
		onError: (error) => {
			toast.error(`Error updating list: ${error.message}`);
		},
	});

	const syncRepositoryDataMutation = trpc.list.syncRepositoryData.useMutation({
		onSuccess: () => {
			toast.success("Repository data has been synced successfully.");
		},
		onError: (error) => {
			toast.error(`Error syncing repository data: ${error.message}`);
		},
	});

	const saveRepositoryMutation = trpc.repository.save.useMutation({
		onSuccess: () => {
			toast.success("Repository has been saved successfully.");
		},
		onError: (error) => {
			toast.error(`Error saving repository: ${error.message}`);
		},
	});

	return {
		createList: createListMutation.mutateAsync,
		deleteList: deleteListMutation.mutateAsync,
		addToList: addToListMutation.mutateAsync,
		removeFromList: removeFromListMutation.mutateAsync,
		updateList: updateMutation.mutateAsync,
		syncRepositoryData: syncRepositoryDataMutation.mutateAsync,
		saveRepository: saveRepositoryMutation.mutateAsync,
	};
}
