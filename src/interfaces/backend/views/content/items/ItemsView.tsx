import { Grid, Table } from "lucide-react";
import { useEffect, useState } from "react";

import type { ContentItem } from "@/domain/models/content/item";
import type { ContentItemWithStats } from "@/domain/models/content/types";

import type { ActionConfig } from "@/ui/components/actions/types";
import { ItemsGrid } from "@/ui/components/content/item/grid/ItemsGrid";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";

import { getItemsActions } from "../../../actions/content/buttons/items";
import { getItemDetailLink } from "../../../views/content/items/utils";
import { ItemsTableLayout } from "./ItemsTableLayout";

interface ItemsViewProps {
  items: ContentItemWithStats[];
  linkToCollection?: boolean;
}

type ViewLayout = "table" | "grid";

export function ItemsView({ items, linkToCollection }: ItemsViewProps) {
  const [layout, setLayout] = useState<ViewLayout>("table");
  const [isLoading, setIsLoading] = useState(true);

  const actions: ActionConfig<ContentItem>[] = [
    {
      id: "toggle-layout",
      label: layout === "table" ? "Grid View" : "Table View",
      icon: layout === "table" ? Grid : Table,
      variant: "outline" as const,
      contexts: ["view"],
      handler: () => {
        setLayout(layout === "table" ? "grid" : "table");
        return Promise.resolve({ success: true });
      },
    },
    ...getItemsActions(),
  ];

  const collectionName = linkToCollection
    ? items[0]?.collectionName || "no-collection"
    : "";

  const title = linkToCollection ? `${collectionName} › Items` : "Items";
  const description = linkToCollection
    ? `Manage items in ${collectionName} collection`
    : "Manage collection items";

  useEffect(() => {
    if (items) {
      setIsLoading(false);
    }
  }, [items]);

  return (
    <ViewContainer
      title={title}
      description={description}
      actions={actions}
      selected={items}
    >
      {isLoading ? (
        "Loading..."
      ) : layout === "table" ? (
        <ItemsTableLayout
          items={items}
          linkToCollection={linkToCollection}
          actions={actions}
        />
      ) : (
        <ItemsGrid
          items={items}
          linkToCollection={linkToCollection}
          getItemDetailLink={getItemDetailLink}
        />
      )}
    </ViewContainer>
  );
}
