import type { SupportLabelTone } from "../../types";

// Persisted label tones stay unchanged; presentation uses the shared Maia
// variants consistently in the editor preview, detail pane, board and table.
export const LABEL_BADGE_VARIANTS = {
  zinc: "secondary",
  blue: "info",
  amber: "warning",
  rose: "destructive-subtle",
  emerald: "success",
  violet: "accent",
} as const satisfies Record<SupportLabelTone, string>;
