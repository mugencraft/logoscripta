import {
	EntityNotFoundError,
	SecurityError,
	ValidationError,
} from "../models/errors";
import {
	type ListItemInsertInput,
	type ListUpdateInput,
	type NewRepositoryList,
	listItemInsertSchema,
} from "../models/repository-list";
import type { RepositoryListCommandsPort } from "../ports/repository-list/commands";
import type { RepositoryListQueriesPort } from "../ports/repository-list/queries";
import {
	type BaseMetadata,
	type ListItemMetadata,
	baseMetadataSchema,
} from "../value-objects/metadata/base";

export class RepositoryListService {
	constructor(
		protected readonly commands: RepositoryListCommandsPort,
		protected readonly queries: RepositoryListQueriesPort,
	) {}

	async create(data: NewRepositoryList) {
		return await this.commands.create(data);
	}

	async delete(listId: number) {
		await this.checkReadOnly(listId);

		return await this.commands.delete(listId);
	}

	async update(listId: number, data: ListUpdateInput) {
		await this.checkReadOnly(listId);
		return await this.commands.update(listId, data);
	}

	async saveToList(data: ListItemInsertInput) {
		await this.checkReadOnly(data.listId);

		try {
			// Validate the input data
			const validationResult = listItemInsertSchema.safeParse(data);
			if (!validationResult.success) {
				throw new Error(
					`Invalid list item data: ${validationResult.error.message}`,
				);
			}

			const existingItem = await this.queries.findItem(
				data.listId,
				data.fullName,
			);

			const processedData = {
				...validationResult.data,
				metadata: await this.processMetadata(
					existingItem?.metadata || {},
					(validationResult.data.metadata as Record<string, unknown>) || {},
				),
			};

			if (existingItem) {
				await this.commands.updateItem(
					data.listId,
					data.fullName,
					processedData,
				);
			} else {
				await this.commands.createItem(processedData);
			}
		} catch (error) {
			if (
				error instanceof EntityNotFoundError ||
				error instanceof SecurityError ||
				error instanceof ValidationError
			) {
				throw error;
			}

			throw new Error(
				`Failed to save item ${data.fullName} to list ${data.listId}: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	async removeFromList(listId: number, fullName: string) {
		await this.checkReadOnly(listId);
		await this.commands.removeItem(listId, fullName);
	}

	private async getList(id: number) {
		const list = await this.queries.findById(id);
		if (!list) {
			throw new EntityNotFoundError(`List ${id} not found`);
		}
		return list;
	}

	private async checkReadOnly(listId: number) {
		const list = await this.getList(listId);

		if (list.readOnly) {
			throw new SecurityError(`Cannot modify read-only list ${listId}`);
		}
	}

	private async processMetadata(
		existingMetadata: Partial<ListItemMetadata> = {},
		metadataUpdate: Record<string, unknown> = {},
	): Promise<ListItemMetadata> {
		const now = new Date().toISOString();

		const result: Partial<ListItemMetadata> = {
			...(existingMetadata || {}),
		};

		if ("base" in metadataUpdate) {
			const baseMetadata = metadataUpdate.base as BaseMetadata;
			const validationResult = baseMetadataSchema.safeParse(baseMetadata);

			if (!validationResult.success) {
				throw new ValidationError(
					`Invalid base metadata: ${validationResult.error.message}`,
				);
			}

			result.base = validationResult.data;
		} else {
			result.base = (existingMetadata?.base as BaseMetadata) || {
				notes: "",
				category: "",
				tags: [],
				rating: 0,
				status: "new",
				lastReviewDate: now,
				relatedItems: [],
			};
		}

		result.system = {
			systemType: "user-managed",
			version: "1.0",
			createdAt: existingMetadata?.system?.createdAt || now,
			updatedAt: now,
		};

		for (const [key, value] of Object.entries(metadataUpdate).filter(
			([key]) => !["base", "system", "metadataTypes"].includes(key),
		)) {
			result[key] = value;
		}

		const customTypes = Object.keys(result).filter(
			(key) => !["base", "system", "metadataTypes"].includes(key),
		);

		result.metadataTypes = ["base", ...customTypes];

		return result as ListItemMetadata;
	}
}
