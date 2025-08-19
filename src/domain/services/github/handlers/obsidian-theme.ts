import type { Change } from "@/core/changes/types";
import type { ObsidianTheme } from "@/shared/obsidian/types";

import {
  type ObsidianThemeMetadata,
  obsidianThemeMetadataSchema,
} from "../../../validation/github/repository-list";
import { createMetadata } from "../../shared/metadata";
import { BaseSystemListHandler } from "./base";

export class ObsidianThemeHandler extends BaseSystemListHandler<
  ObsidianTheme,
  ObsidianThemeMetadata
> {
  protected async createMetadata(
    change: Change<ObsidianTheme>,
  ): Promise<ObsidianThemeMetadata> {
    return createMetadata(obsidianThemeMetadataSchema, {
      theme: change.data,
    });
  }
}
