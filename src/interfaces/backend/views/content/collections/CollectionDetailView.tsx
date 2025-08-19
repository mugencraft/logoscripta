import { Link, useRouter } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import type { CollectionType } from "@/domain/models/content/types";
import type { ContentCollectionMetadata } from "@/domain/validation/content/collection";
import { trpc } from "@/interfaces/server-client";

import { Badge } from "@/ui/components/core/badge";
import { Button } from "@/ui/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/core/card";
import { Input } from "@/ui/components/core/input";
import { Label } from "@/ui/components/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/core/select";
import { Switch } from "@/ui/components/core/switch";
import { Textarea } from "@/ui/components/core/textarea";
import { ViewContainer } from "@/ui/components/layout/ViewContainer";

import { Route } from "../../../routes/content/collections/$collectionId";

export function CollectionDetailView() {
  const collection = Route.useLoaderData();
  const items = collection.items;
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: collection.name,
    description: collection.description || "",
    type: collection.type,
  });

  // Extract metadata with proper typing
  const [metadata, setMetadata] = useState<ContentCollectionMetadata>(
    collection.metadata,
  );

  const updateMutation = trpc.content.collections.update.useMutation({
    onSuccess: () => {
      toast.success("Collection updated successfully");
      setIsEditMode(false);
      router.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update collection: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.collections.delete.useMutation({
    onSuccess: () => {
      toast.success("Collection deleted successfully");
      router.navigate({ to: "/content/collections" });
    },
    onError: (error) => {
      toast.error(`Failed to delete collection: ${error.message}`);
    },
  });

  const nameId = useId();
  const descriptionId = useId();

  const _handleSave = async () => {
    await updateMutation.mutateAsync({
      id: collection.id,
      data: {
        ...formData,
        metadata,
      },
    });
  };

  const _handleDelete = async () => {
    if (items.length > 0) {
      toast.error(
        "Cannot delete collection with items. Move or delete items first.",
      );
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this collection? This action cannot be undone.",
      )
    ) {
      await deleteMutation.mutateAsync(collection.id);
    }
  };

  const _handleCancel = () => {
    setFormData({
      name: collection.name,
      description: collection.description || "",
      type: collection.type,
    });
    setMetadata(collection.metadata);
    setIsEditMode(false);
  };

  const handleMetadataUpdate = (
    newMetadata: Partial<ContentCollectionMetadata>,
  ) => {
    setMetadata((prev) => ({ ...prev, ...newMetadata }));
  };

  // Calculate collection statistics
  const stats = {
    totalItems: items.length,
    totalTags: new Set(
      items.flatMap((item) => item.tags?.map((t) => t.tag.name) || []),
    ).size,
    taggedItems: items.filter((item) => (item.tags?.length || 0) > 0).length,
    averageTagsPerItem:
      items.length > 0
        ? items.reduce((sum, item) => sum + (item.tags?.length || 0), 0) /
          items.length
        : 0,
  };

  return (
    <ViewContainer
      title={isEditMode ? `Edit: ${collection.name}` : collection.name}
      description={
        isEditMode
          ? "Modify collection details and settings"
          : collection.description || "Collection details and management"
      }
    >
      <div className="space-y-6">
        {/* Collection Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unique Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTags}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Tagged Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.taggedItems}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalItems > 0
                  ? Math.round((stats.taggedItems / stats.totalItems) * 100)
                  : 0}
                % completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Tags/Item
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageTagsPerItem.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collection Details */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
            <CardDescription>
              Basic information and settings for this collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Collection Name</Label>
                  <Input
                    value={formData.name}
                    id={nameId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter collection name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={descriptionId}>Description</Label>
                  <Textarea
                    id={descriptionId}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe this collection"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: CollectionType) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="urls">URLs</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="mixed">Mixed Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Name
                  </Label>
                  <p className="text-base">{collection.name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Type
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{collection.type}</Badge>
                  </div>
                </div>

                {collection.description && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-base">{collection.description}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Created
                  </Label>
                  <p className="text-base">
                    {new Date(
                      collection.metadata.system.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>

                {collection.metadata.system.updatedAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Updated
                    </Label>
                    <p className="text-base">
                      {new Date(
                        collection.metadata.system.updatedAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Collection Settings - only shown in edit mode or if settings exist */}
        {(isEditMode ||
          metadata.display ||
          metadata.processing ||
          metadata.import) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Collection Settings
              </CardTitle>
              <CardDescription>
                Advanced settings for collection behavior and display
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <div className="space-y-6">
                  {/* Display Settings */}
                  {/* <div className="space-y-4">
										<h4 className="text-sm font-medium">Display Settings</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>Layout</Label>
												<Select
													value={metadata.display?.layout || "grid"}
													onValueChange={(value) =>
														handleMetadataUpdate({
															display: {
																...metadata.display,
																layout: value as any,
															},
														})
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="grid">Grid</SelectItem>
														<SelectItem value="list">List</SelectItem>
														<SelectItem value="timeline">Timeline</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div> */}
                  {/* Processing Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Processing Settings</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={metadata.processing?.autoTagging || false}
                        onCheckedChange={(checked) =>
                          handleMetadataUpdate({
                            processing: {
                              ...metadata.processing,
                              autoTagging: checked,
                            },
                          })
                        }
                      />
                      <Label>Enable auto-tagging for new items</Label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metadata.display && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Layout
                      </Label>
                      <p className="text-base">{metadata.display.layout}</p>
                    </div>
                  )}
                  {metadata.processing && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Auto-tagging
                      </Label>
                      <p className="text-base">
                        {metadata.processing.autoTagging
                          ? "Enabled"
                          : "Disabled"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common operations for this collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/content/collections/$collectionId/items"
                params={{ collectionId: collection.id.toString() }}
              >
                <Button variant="outline" className="w-full">
                  View Items ({items.length})
                </Button>
              </Link>

              <Link
                to="/content/collections/$collectionId/analysis"
                params={{ collectionId: collection.id.toString() }}
              >
                <Button variant="outline" className="w-full">
                  Analysis
                </Button>
              </Link>

              <Button variant="outline" className="w-full" disabled>
                Export Data
              </Button>

              <Button variant="outline" className="w-full" disabled>
                Import Items
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ViewContainer>
  );
}
