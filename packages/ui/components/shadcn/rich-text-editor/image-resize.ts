export const IMAGE_RESIZE_MIN_PX = 150;

export function resolveImageResizeAriaValues({
  currentWidthPx,
  maxWidthPx,
}: {
  currentWidthPx: number;
  maxWidthPx: number;
}): { min: number; max: number; now: number } {
  const min = IMAGE_RESIZE_MIN_PX;
  const finiteMax =
    Number.isFinite(maxWidthPx) && maxWidthPx > 0
      ? maxWidthPx
      : Math.max(currentWidthPx, min);
  const max = Math.max(min, finiteMax);
  const now = Math.min(Math.max(currentWidthPx, min), max);
  return { min, max, now };
}

export function normalizeImageWidth(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) return "100%";
    if (/^\d+$/.test(normalizedValue)) return `${normalizedValue}px`;

    return normalizedValue;
  }

  return "100%";
}
