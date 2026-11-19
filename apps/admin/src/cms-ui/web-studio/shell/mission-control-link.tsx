"use client";

import { useWebStudioOrganization } from "./web-studio-document";

import type { ComponentProps } from "react";

/** Mission Control's address from Web Studio when no organization is selected. */
export const MISSION_CONTROL_HREF = "/";

/**
 * A link out of Web Studio to Mission Control, always a full document load
 * (AL-2675, council C12): nothing of Web Studio's document, its organization
 * or its Payload state stays behind. Never Payload's or Next's client `Link`.
 *
 * It goes to the home of the organization Web Studio works in, under that
 * organization's tenant address (council on the joined release, JC3): `/`
 * would send a person in two organizations to Mission Control's chooser and
 * lose where they were. Outside a Web Studio document it goes to `/`.
 */
export function MissionControlLink(props: Omit<ComponentProps<"a">, "href">) {
  const organization = useWebStudioOrganization();
  return (
    <a
      {...props}
      href={organization?.missionControlHref ?? MISSION_CONTROL_HREF}
    />
  );
}
