import { defineConfig } from "oxfmt";
import {
  ignorePatterns,
  trustedOptions,
} from "./scripts/lib/format-options.mts";

export default defineConfig({
  ...trustedOptions,
  ignorePatterns: [
    ...ignorePatterns,
    "!packages/database/types/currency-foundation.generated.ts",
  ],
});
