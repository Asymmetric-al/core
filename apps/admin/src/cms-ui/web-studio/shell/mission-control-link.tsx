import type { ComponentProps } from "react";

/** Mission Control's address from Web Studio. */
export const MISSION_CONTROL_HREF = "/";

/**
 * A link out of Web Studio to Mission Control, always a full document load
 * (AL-2675, council C12): nothing of Web Studio's document, its organization
 * or its Payload state stays behind, and Mission Control resolves its own
 * organization afresh. Never Payload's or Next's client `Link`.
 */
export function MissionControlLink(props: Omit<ComponentProps<"a">, "href">) {
  return <a {...props} href={MISSION_CONTROL_HREF} />;
}
