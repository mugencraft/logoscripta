import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/main.tsx", "scripts/apply-captions.cjs"],
  // Ignore patterns
  ignore: [
    "src/interfaces/backend/routeTree.gen.ts",
    "src/core/serialization/csv.ts",
    "src/domain/validation/shared.ts",
    "test/helpers/setup.ts",
    "test/helpers/time.ts",
    "src/ui/components/tagging/useTagValidation.ts",
    "src/ui/components/extra/date-picker.tsx",
    "src/ui/components/core/calendar.tsx",
  ],
  ignoreExportsUsedInFile: true,
  // Dependencies to ignore in checks
  ignoreDependencies: [
    "@commitlint/cli",
    "@radix-ui/*",
    "@types/inquirer",
    "lint-staged",
    "react-day-picker",
  ],
  ignoreBinaries: ["trafilatura", "dot"],
};

export default config;
