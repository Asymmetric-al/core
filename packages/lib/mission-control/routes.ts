const LEGACY_MISSION_CONTROL_PREFIX = "/mc";

export function resolveMissionControlHref(href: string): string {
  if (href === LEGACY_MISSION_CONTROL_PREFIX) {
    return "/";
  }

  if (href.startsWith(`${LEGACY_MISSION_CONTROL_PREFIX}/`)) {
    const normalizedHref = href.slice(LEGACY_MISSION_CONTROL_PREFIX.length);
    return normalizedHref || "/";
  }

  return href;
}
