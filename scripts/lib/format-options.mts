import preset from "ultracite/oxfmt";
import type { FormatConfig } from "oxfmt";

const { ignorePatterns, ...options } = preset;
export { ignorePatterns };
export const trustedOptions = {
  ...options,
  trailingComma: "all",
  proseWrap: "preserve",
  sortPackageJson: true,
  sortImports: false,
  sortTailwindcss: false,
} satisfies FormatConfig;
