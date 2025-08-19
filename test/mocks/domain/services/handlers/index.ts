import { vi } from "vitest";

import type { Change } from "@/core/changes/types";
import type { ObsidianPluginHandler } from "@/domain/services/github/handlers/obsidian-plugin";
import type { ObsidianThemeHandler } from "@/domain/services/github/handlers/obsidian-theme";
import type {
  ObsidianPlugin,
  ObsidianPluginRemoved,
  ObsidianTheme,
} from "@/shared/obsidian/types";

interface MockObsidianHandlerOptions {
  initialization?: {
    listError?: Error;
    stateError?: Error;
  };
  changeHandling?: {
    handleImplementation?: (change: Change<unknown>) => Promise<void>;
  };
  removal?: {
    handleImplementation?: (
      removal: ObsidianPluginRemoved,
      fullName: string,
    ) => Promise<string | undefined>;
  };
}

export function createMockObsidianPluginHandler(
  options: MockObsidianHandlerOptions = {},
): ObsidianPluginHandler {
  return {
    setList: vi.fn().mockImplementation(async () => {
      if (options.initialization?.listError) {
        throw options.initialization.listError;
      }
    }),

    initializeState: vi.fn().mockImplementation(async () => {
      if (options.initialization?.stateError) {
        throw options.initialization.stateError;
      }
    }),

    handle: vi
      .fn()
      .mockImplementation(async (change: Change<ObsidianPlugin>) => {
        if (options.changeHandling?.handleImplementation) {
          return options.changeHandling.handleImplementation(change);
        }
      }),

    handleArchival: vi
      .fn()
      .mockImplementation(
        async (
          removal: ObsidianPluginRemoved,
          fullName: string,
        ): Promise<string | undefined> => {
          if (options.removal?.handleImplementation) {
            return options.removal.handleImplementation(removal, fullName);
          }
          return fullName;
        },
      ),

    createMetadata: vi.fn(),
  } as unknown as ObsidianPluginHandler;
}

export function createMockObsidianThemeHandler(
  options: MockObsidianHandlerOptions = {},
): ObsidianThemeHandler {
  return {
    setList: vi.fn().mockImplementation(async () => {
      if (options.initialization?.listError) {
        throw options.initialization.listError;
      }
    }),

    handle: vi
      .fn()
      .mockImplementation(async (change: Change<ObsidianTheme>) => {
        if (options.changeHandling?.handleImplementation) {
          return options.changeHandling.handleImplementation(change);
        }
      }),

    handleArchival: vi
      .fn()
      .mockImplementation(
        async (
          removal: ObsidianPluginRemoved,
          fullName: string,
        ): Promise<string | undefined> => {
          if (options.removal?.handleImplementation) {
            return options.removal.handleImplementation(removal, fullName);
          }
          return fullName;
        },
      ),

    createMetadata: vi.fn(),
  } as unknown as ObsidianThemeHandler;
}
