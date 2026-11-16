import { ImageOff } from "lucide-react";

import { cn } from "@asym/ui/lib/utils";

/**
 * The one "missing media" treatment for Ministry Update images, so a broken
 * photo reads the same on the donor feed and the missionary feed instead of a
 * native broken-image glyph. The caller owns the frame (border, radius,
 * height); this fills it.
 */
export function MinistryUpdateMediaUnavailable({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground",
        className,
      )}
    >
      <ImageOff aria-hidden className="size-6" />
      <span className="text-sm font-medium">Image unavailable</span>
    </div>
  );
}
