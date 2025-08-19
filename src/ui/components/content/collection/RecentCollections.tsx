import type { ContentCollectionWithStats } from "@/domain/models/content/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";

interface RecentCollectionsProps {
  collections?: ContentCollectionWithStats[];
}

export const RecentCollections = ({ collections }: RecentCollectionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {collections?.slice(0, 5).map((collection) => (
            <div
              key={collection.id}
              className="flex items-center justify-between p-2 rounded border"
            >
              <div>
                <h4 className="font-medium">{collection.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {collection.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono">
                  {collection.totalItems || 0} items
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(
                    collection.metadata.system.createdAt,
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
