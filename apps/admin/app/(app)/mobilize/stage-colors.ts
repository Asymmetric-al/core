import type { Stage } from "./mobilize-sections";

export const STAGE_COLORS: Record<Stage, string> = {
  Applied: "border-zinc-200 bg-zinc-100 text-zinc-700",
  Vetting: "border-blue-200 bg-blue-50 text-blue-700",
  Training: "border-purple-200 bg-purple-50 text-purple-700",
  Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Deployed: "border-indigo-200 bg-indigo-50 text-indigo-700",
};
