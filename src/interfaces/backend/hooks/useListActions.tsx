import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useListOperations } from "./useListOperations";

interface ListActionsConfig {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export function useListActions({ onSuccess, onError }: ListActionsConfig = {}) {
	const {
		createList,
		deleteList,
		addToList,
		removeFromList,
		syncRepositoryData,
		saveRepository,
	} = useListOperations();
	const navigate = useNavigate();

	const router = useRouter();

	const handleAddToList = async (listId: number, items: string[]) => {
		try {
			for (const fullName of items) {
				await addToList({
					data: { listId, fullName },
				});
			}

			const currentRoute = router.state.location.pathname;
			if (["/lists", `/lists/${listId}`].includes(currentRoute)) {
				await router.invalidate();
			}

			toast.success("Items added successfully", {
				action: {
					label: "View List",
					onClick: () =>
						navigate({
							to: "/lists/$id",
							params: { id: listId.toString() },
						}),
				},
			});

			onSuccess?.();
		} catch (error) {
			toast.error("Failed to add items to list", {
				description: "Please try again",
			});
			onError?.(error as Error);
		}
	};

	const handleDeleteList = async (listId: number) => {
		try {
			await deleteList(listId);
			const currentRoute = router.state.location.pathname;
			if (currentRoute === "/lists") {
				await router.invalidate();
			} else if (currentRoute === `/lists/${listId}`) {
				await router.navigate({ to: "/lists" });
			}
			toast.success("List deleted successfully");
		} catch (error) {
			toast.error("Failed to delete list");
			onError?.(error as Error);
		}
	};

	const handleCreateList = async (name: string, items?: string[]) => {
		try {
			const list = await createList({
				name: name.trim(),
				description: "",
			});

			if (!list) throw new Error("Failed to create list");

			if (items?.length) {
				await handleAddToList(list.id, items);
			}

			const currentRoute = router.state.location.pathname;
			if (currentRoute === "/lists") {
				await router.invalidate();
			}

			toast.success(`Created list ${list.name}`, {
				action: {
					label: "View List",
					onClick: () =>
						navigate({
							to: "/lists/$id",
							params: { id: list.id.toString() },
						}),
				},
			});

			onSuccess?.();
			return list;
		} catch (error) {
			toast.error("Failed to create list");
			onError?.(error as Error);
			return null;
		}
	};
	const handleRemoveFromList = async (listId: number, items: string[]) => {
		try {
			for (const fullName of items) {
				await removeFromList({ listId, fullName });
			}

			const currentRoute = router.state.location.pathname;
			if (currentRoute === `/lists/${listId}`) {
				// This will re-run the loader and update both list and items
				await router.invalidate();
			}

			toast.success("Items removed successfully", {
				action: {
					label: "View List",
					onClick: () =>
						navigate({
							to: "/lists/$id",
							params: { id: listId.toString() },
						}),
				},
			});

			onSuccess?.();
		} catch (error) {
			toast.error("Failed to remove items from list");
			onError?.(error as Error);
		}
	};

	const handleSyncRepositoryData = async (
		options: {
			listIds?: number[];
			fullNames?: string[];
			skipIntegrateNew?: boolean;
		} = {},
	) => {
		try {
			console.log(options);
			const result = await syncRepositoryData(options);

			if (!result) {
				toast.error("Failed to sync repository data");
				return;
			}

			toast.success(
				<ul>
					<li>{result.total} items have been processed.</li>
					<li>{result.created} new repositories have been created.</li>
					<li>{result.linked} items have been linked.</li>
					<li>{result.updated} items have been updated.</li>
					<li>{result.notFound.length} items couldn't be linked or created.</li>
					<li>
						{result.failed.length} items failed during GitHub integration.
					</li>
				</ul>,
			);

			const pathsToInvalidate =
				options.listIds?.map((listId) => {
					return `/lists/${listId}`;
				}) || [];

			if (options.fullNames?.length) {
				pathsToInvalidate.push("/repos");
			}

			const currentRoute = router.state.location.pathname;
			for (const path of pathsToInvalidate) {
				if (currentRoute === path) {
					await router.invalidate();
				}
			}

			onSuccess?.();
		} catch (error) {
			toast.error("Failed to sync repository data");
			onError?.(error as Error);
		}
	};

	const handleSaveRepository = async (fullName: string) => {
		try {
			const result = await saveRepository(fullName);

			if (!result) {
				toast.error(`Repository ${fullName} not found`);
				return;
			}

			toast.success(
				`Repository ${result.fullName} has been saved successfully.`,
			);

			const currentRoute = router.state.location.pathname;
			if (currentRoute === "/repos") {
				await router.invalidate();
			}

			onSuccess?.();
		} catch (error) {
			toast.error(`Failed to save repository ${fullName}`);
			onError?.(error as Error);
		}
	};

	return {
		handleAddToList,
		handleCreateList,
		handleRemoveFromList,
		handleDeleteList,
		handleSyncRepositoryData,
		handleSaveRepository,
	};
}
