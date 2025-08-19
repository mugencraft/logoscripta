import type { BaseMetadata } from "@/domain/validation/shared";

export const SystemMetadata = ({ metadata }: { metadata: BaseMetadata }) => {
  return (
    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
      <div className="flex justify-between">
        <span>Created:</span>
        <span>{new Date(metadata.system.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Updated:</span>
        <span>
          {metadata.system.updatedAt
            ? new Date(metadata.system.updatedAt).toLocaleDateString()
            : "-"}
        </span>
      </div>
    </div>
  );
};
