import type { Stage } from "./mobilize-sections";

export const STAGE_VARIANTS: Record<
  Stage,
  "secondary" | "info" | "warning" | "success" | "default"
> = {
  Applied: "secondary",
  Vetting: "info",
  Training: "warning",
  Ready: "success",
  Deployed: "default",
};
