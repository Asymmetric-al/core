export function formatValidatedAtUtcLabel(validatedAt?: string): string | null {
  if (!validatedAt) {
    return null;
  }

  const date = new Date(validatedAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const iso = date.toISOString();
  return `${iso.slice(0, 16).replace("T", " ")} UTC`;
}
