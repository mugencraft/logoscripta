import { EntityNotFoundError, SecurityError } from "../models/errors";
import {
	type NewRepositoryList,
	type SaveToListInput,
	repositoryListValidator,
} from "../models/repository-list";
import type { RepositoryListCommandsPort } from "../ports/repository-list/commands";
import type { RepositoryListQueriesPort } from "../ports/repository-list/queries";

export class RepositoryListService {
	constructor(
		protected readonly commands: RepositoryListCommandsPort,
		protected readonly queries: RepositoryListQueriesPort,
	) {}

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

	async create(data: NewRepositoryList) {
		return await this.commands.create(data);
	}

	async delete(listId: number) {
		await this.checkReadOnly(listId);

		return await this.commands.delete(listId);
	}

	async update(listId: number, data: Partial<NewRepositoryList>) {
		await this.checkReadOnly(listId);
		return await this.commands.update(listId, data);
	}

	async saveToList(data: SaveToListInput) {
		await this.checkReadOnly(data.listId);

		try {
			// Validate the input data
			const validationResult = repositoryListValidator.validateSaveToList(data);
			if (!validationResult.success) {
				throw new Error(
					`Invalid list item data: ${validationResult.error.message}`,
				);
			}

			const list = await this.queries.findById(data.listId);
			if (!list) {
				throw new EntityNotFoundError(`List ${data.listId} not found`);
			}

			if (list.readOnly) {
				throw new SecurityError(`Cannot modify read-only list ${data.listId}`);
			}

			const existingItem = await this.queries.findItem(
				data.listId,
				data.fullName,
			);

			if (existingItem) {
				await this.commands.updateItem(
					data.listId,
					data.fullName,
					validationResult.data,
				);
			} else {
				await this.commands.createItem(validationResult.data);
			}
		} catch (error) {
			if (
				error instanceof EntityNotFoundError ||
				error instanceof SecurityError
			) {
				throw error;
			}
			// Add context to the error
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
}
