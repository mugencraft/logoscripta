import type { Change } from "@/core/changes/types";
import type { ObsidianPluginHandler } from "@/domain/services/handlers/obsidian-plugin";
import type { ObsidianThemeHandler } from "@/domain/services/handlers/obsidian-theme";
import type {
	ObsidianPlugin,
	ObsidianPluginRemoved,
	ObsidianPluginsDeprecation,
	ObsidianPluginsStats,
	ObsidianTheme,
} from "@/shared/obsidian/types";
import { vi } from "vitest";

interface MockObsidianHandlerOptions {
	initialization?: {
		listError?: Error;
		stateError?: Error;
	};
	changeHandling?: {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		handleImplementation?: (change: Change<any>) => Promise<void>;
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
		setList: vi.fn().mockImplementation(async (systemType: string) => {
			if (options.initialization?.listError) {
				throw options.initialization.listError;
			}
		}),

		initializeState: vi
			.fn()
			.mockImplementation(
				async (
					stats: ObsidianPluginsStats,
					deprecation: ObsidianPluginsDeprecation,
				) => {
					if (options.initialization?.stateError) {
						throw options.initialization.stateError;
					}
				},
			),

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
		setList: vi.fn().mockImplementation(async (systemType: string) => {
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

		handleArchival: vi.fn().mockImplementation(
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			async (removal: any, fullName: string): Promise<string | undefined> => {
				if (options.removal?.handleImplementation) {
					return options.removal.handleImplementation(removal, fullName);
				}
				return fullName;
			},
		),

		createMetadata: vi.fn(),
	} as unknown as ObsidianThemeHandler;
}
