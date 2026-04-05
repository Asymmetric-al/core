const ALLOWED_POST_LINK_PROTOCOLS = new Set(["http:", "https:"]);

function tryParseLinkHref(value: string): URL | null {
  if (value !== value.trim() || /\s/.test(value)) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    if (value.includes(".") && !value.includes("://")) {
      try {
        return new URL(`https://${value}`);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function normalizePostLinkHref(value: string): string | null {
  if (!value) return null;

  const parsed = tryParseLinkHref(value);
  if (!parsed) return null;

  if (!ALLOWED_POST_LINK_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
    return null;
  }

  return parsed.toString();
}

export function isAllowedPostLinkHref(value: string): boolean {
  return normalizePostLinkHref(value) !== null;
}
