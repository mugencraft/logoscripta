import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import type {
  ActionCallbacks,
  ActionHandler,
} from "@/ui/components/actions/types";

interface EntityConfig<TEntity> {
  getDisplayName: (entity: TEntity) => string;
  routes?: {
    list: string;
    detail: string;
    idName: string;
  };
}

interface CrudMutations {
  // biome-ignore lint/suspicious/noExplicitAny: TRPC mutation
  create: any;
  // biome-ignore lint/suspicious/noExplicitAny: TRPC mutation
  update: any;
  // biome-ignore lint/suspicious/noExplicitAny: TRPC mutation
  delete: any;
}

interface CrudHooks<TEntity, TNewEntity> {
  // Customizable success/error messages
  messages?: {
    create?: {
      success?: (data: TNewEntity) => string;
      error?: (error: unknown) => string;
    };
    update?: {
      success?: (data: TEntity) => string;

      error?: (error: unknown) => string;
    };
    delete?: {
      success?: (data: TEntity) => string;
      error?: (error: unknown) => string;
    };
  };
  // Custom logic hooks
  beforeCreate?: (data: TNewEntity) => Promise<TNewEntity>;
  afterCreate?: (data: TNewEntity, result: TEntity) => Promise<void>;
  beforeUpdate?: (data: TEntity) => Promise<TEntity>;
  afterUpdate?: (data: TEntity, result: TEntity) => Promise<void>;
  beforeDelete?: (data: TEntity) => Promise<boolean>; // return false to cancel
  afterDelete?: (data: TEntity) => Promise<void>;
}

export function useCrudActions<
  TEntity extends { id: number },
  TNewEntity = Omit<TEntity, "id">,
>(
  mutations: CrudMutations,
  config: EntityConfig<TEntity>,
  options: CrudHooks<TEntity, TNewEntity> = {},
  callbacks: ActionCallbacks = {},
) {
  const router = useRouter();
  const { onSuccess } = callbacks;

  const getDefaultMessage = (
    operation: string,
    entity: TEntity | TNewEntity,
  ) => {
    const entityRecord = entity as Record<string, unknown>;

    const name =
      "id" in entityRecord
        ? config.getDisplayName(entity as TEntity)
        : `New ${
            typeof entityRecord.name === "string" ? entityRecord.name : "item"
          }`;

    switch (operation) {
      case "create":
        return `${name} created successfully`;
      case "update":
        return `${name} updated successfully`;
      case "delete":
        return `${name} deleted successfully`;
      default:
        return "Operation completed successfully";
    }
  };

  const handleCreate: ActionHandler<TNewEntity> = async ({ data }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }

    try {
      // Before hook
      const processedData = options.beforeCreate
        ? (await options.beforeCreate(data)) || data
        : data;

      const result = await mutations.create.mutateAsync(processedData);

      if (!result) {
        toast.error("Creation returned no data");
        return { success: false };
      }

      // After hook
      if (options.afterCreate) {
        await options.afterCreate(processedData, result);
      }

      const successMessage =
        options.messages?.create?.success?.(processedData) ||
        getDefaultMessage("create", processedData);
      toast.success(successMessage);

      await router.invalidate();
      onSuccess?.();
      return { success: true, data: result };
    } catch (error: unknown) {
      const errorMessage =
        options.messages?.create?.error?.(error) ||
        `Failed to create: ${error instanceof Error ? error.message : error}`;
      toast.error(errorMessage);
      return { success: false };
    }
  };

  const handleUpdate: ActionHandler<TEntity> = async ({ data }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }

    try {
      // Before hook
      const processedData = options.beforeUpdate
        ? (await options.beforeUpdate(data)) || data
        : data;

      const result = await mutations.update.mutateAsync({
        id: processedData.id,
        data: processedData,
      });

      if (!result) {
        toast.error("Update returned no data");
        return { success: false };
      }

      // After hook
      if (options.afterUpdate) {
        await options.afterUpdate(processedData, result);
      }

      const successMessage =
        options.messages?.update?.success?.(processedData) ||
        getDefaultMessage("update", processedData);
      toast.success(successMessage);

      await router.invalidate();
      onSuccess?.();
      return { success: true, data: result };
    } catch (error: unknown) {
      const errorMessage =
        options.messages?.update?.error?.(error) ||
        `Failed to update: ${error instanceof Error ? error.message : error}`;
      toast.error(errorMessage);
      return { success: false };
    }
  };

  const handleDelete: ActionHandler<TEntity> = async ({ data }) => {
    if (!data) {
      toast.error("No data provided");
      return { success: false };
    }

    try {
      // Before hook - can cancel operation
      if (options.beforeDelete) {
        const shouldContinue = await options.beforeDelete(data);
        if (!shouldContinue) {
          return { success: false };
        }
      }

      await mutations.delete.mutateAsync(data.id);

      // After hook
      if (options.afterDelete) {
        await options.afterDelete(data);
      }

      await router.invalidate();

      const successMessage =
        options.messages?.delete?.success?.(data) ||
        getDefaultMessage("delete", data);
      toast.success(successMessage);

      onSuccess?.();

      // Navigate if configured
      if (config.routes) {
        const currentRoute = router.matchRoute({
          to: config.routes.detail,
          params: { [config.routes.idName]: data.id.toString() },
        });

        if (currentRoute) {
          await router.navigate({ to: config.routes.list });
        }
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        options.messages?.delete?.error?.(error) ||
        `Failed to delete: ${error instanceof Error ? error.message : error}`;
      toast.error(errorMessage);
      return { success: false };
    }
  };

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
