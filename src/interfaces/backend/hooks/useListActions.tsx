import type { ListItemMetadata } from "@/domain/value-objects/metadata/base";
import { type List, trpc } from "@/interfaces/server-client";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

interface ListActionsConfig {
	onSuccess?: () => void;
}

export interface SyncRepositoryDataOptions {
	listIds?: number[];
	fullNames?: string[];
	skipIntegrateNew?: boolean;
}

export function useListActions({ onSuccess }: ListActionsConfig = {}) {
	const navigate = useNavigate();

	const router = useRouter();

	const createListMutation = trpc.list.create.useMutation();
	const addToListMutation = trpc.list.saveToList.useMutation();
	const updateListMutation = trpc.list.update.useMutation();
	const deleteListMutation = trpc.list.delete.useMutation();
	const removeFromListMutation = trpc.list.removeFromList.useMutation();
	const syncRepoMutation = trpc.list.syncRepositoryData.useMutation();
	const saveRepositoryMutation = trpc.repository.save.useMutation();

	const handleCreateList = async (
		name: string,
		description = "",
		items?: string[],
	) => {
		try {
			const list = await createListMutation.mutateAsync({
				name: name.trim(),
				description: description.trim(),
			});

			if (!list) {
				// this is not supposed to happen
				toast.error(`Error handling list creation errors: ${name}`);
				return null;
			}

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
			// biome-ignore lint/suspicious/noExplicitAny:
		} catch (error: any) {
			toast.error(`Error creating list: ${error.message}`);
			return null;
		}
	};

	const handleAddToList = async (
		listId: number,
		items: string[],
		metadata: Partial<ListItemMetadata> = {},
	) => {
		const errored: string[] = [];
		for (const fullName of items) {
			try {
				await addToListMutation.mutateAsync({
					listId,
					fullName,
					metadata,
				});
			} catch (error) {
				errored.push(fullName);
			}
		}

		const currentRoute = router.state.location.pathname;
		if (["/lists", `/lists/${listId}`].includes(currentRoute)) {
			await router.invalidate();
		}

		if (errored.length === items.length) {
			toast.error(`Error adding items to list: ${errored.join(", ")}`);
			return;
		}

		if (errored.length > 0) {
			toast.warning(
				`Error adding ${errored.length} items to list: ${errored.join(", ")}`,
			);
		}

		toast.success(`${items.length - errored.length} items added successfully`, {
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
	};

	const handleUpdateList = async (listId: number, data: Partial<List>) => {
		try {
			await updateListMutation.mutateAsync({
				listId,
				data: {
					name: data.name,
					description: data.description,
				},
			});
			toast.success(`List ${data.name} updated successfully!`);
			// biome-ignore lint/suspicious/noExplicitAny:
		} catch (error: any) {
			toast.error(`Error updating list: ${error.message}`);
		}
	};

	const handleDeleteList = async (listId: number) => {
		try {
			await deleteListMutation.mutateAsync(listId);

			const currentRoute = router.state.location.pathname;
			if (currentRoute === "/lists") {
				await router.invalidate();
			} else if (currentRoute === `/lists/${listId}`) {
				await router.navigate({ to: "/lists" });
			}
			toast.success("List deleted successfully");
			onSuccess?.();
			// biome-ignore lint/suspicious/noExplicitAny:
		} catch (error: any) {
			toast.error(`Error deleting list: ${error.message}`);
		}
	};

	const handleRemoveFromList = async (listId: number, items: string[]) => {
		const errors: string[] = [];
		for (const fullName of items) {
			try {
				await removeFromListMutation.mutateAsync({ listId, fullName });
				// biome-ignore lint/suspicious/noExplicitAny:
			} catch (error: any) {
				errors.push(error.message);
				toast.error(`Error removing items from list: ${error.message}`);
			}

			if (errors.length === items.length) {
				toast.error(`Error removing items from list: ${errors.join(", ")}`);
				return;
			}
			if (errors.length > 0) {
				toast.warning(
					`Error removing ${errors.length} items from list: ${errors.join(", ")}`,
				);
			}
			toast.success(
				`${items.length - errors.length} items removed successfully`,
				{
					action: {
						label: "View List",
						onClick: () =>
							navigate({
								to: "/lists/$id",
								params: { id: listId.toString() },
							}),
					},
				},
			);

			const currentRoute = router.state.location.pathname;
			if (currentRoute === `/lists/${listId}`) {
				await router.invalidate();
			}
			onSuccess?.();
		}
	};

	const handleSyncRepositoryData = async (
		options: SyncRepositoryDataOptions = {},
	) => {
		const result = await syncRepoMutation.mutateAsync(options);

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
				<li>{result.failed.length} items failed during GitHub integration.</li>
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
	};

	const handleSaveRepository = async (fullName: string) => {
		const result = await saveRepositoryMutation.mutateAsync(fullName);

		if (!result) {
			toast.error(`Repository ${fullName} not found`);
			return;
		}

		toast.success(`Repository ${result.fullName} has been saved successfully.`);

		const currentRoute = router.state.location.pathname;
		if (currentRoute === "/repos") {
			await router.invalidate();
		}

		onSuccess?.();
	};

	return {
		handleCreateList,
		handleUpdateList,
		handleDeleteList,
		handleAddToList,
		handleRemoveFromList,
		handleSyncRepositoryData,
		handleSaveRepository,
	};
}
