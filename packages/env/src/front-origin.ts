export function canonicalOrigin(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin === value ? url.origin : null;
  } catch {
    return null;
  }
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

export function canonicalUpstreamOrigin(
  value: string | null | undefined,
): string | null {
  const canonical = canonicalOrigin(value);
  if (!canonical) return null;
  const url = new URL(canonical);
  if (url.protocol === "http:" && !isLoopbackHostname(url.hostname)) {
    return null;
  }
  return canonical;
}
