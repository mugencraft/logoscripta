import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: ["src/main.tsx", "src/index.ts"],
	// Ignore patterns
	ignore: [
		"src/interfaces/backend/routeTree.gen.ts",
		"src/core/serialization/csv.ts",
		"src/application/commands/list-item.ts",
		"src/domain/models/owner.ts",
		"src/domain/models/topic.ts",
		"src/domain/value-objects/metadata/base.ts",
		"src/domain/value-objects/metadata/obsidian.ts",
		"src/ui/components/core/**/*",
		"src/ui/components/extra/**/*",
		"test/helpers/setup.ts",
		"test/helpers/time.ts",
	],
	// Dependencies to ignore in checks
	ignoreDependencies: [
		"@commitlint/cli",
		"@radix-ui/*",
		"@types/inquirer",
		"cmdk",
		"lint-staged",
		"react-day-picker",
	],
	ignoreBinaries: ["trafilatura", "dot"],
};

export default config;
