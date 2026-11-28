import {
  crossAppHref,
  isServeUnderPathsEnabled,
} from "@asym/database/document-reload";

export function formatInvitationAddress(
  created: { role: "staff" | "missionary"; invitePath: string },
  origin: string,
): string {
  if (isServeUnderPathsEnabled()) {
    const targetApp = created.role === "staff" ? "admin" : "missionary";
    const prefixed = crossAppHref(targetApp, created.invitePath);
    return origin ? `${origin}${prefixed}` : prefixed;
  }
  if (created.role === "staff") {
    return origin ? `${origin}${created.invitePath}` : created.invitePath;
  }
  return created.invitePath;
}

export function invitationAddressLabel(role: "staff" | "missionary"): string {
  if (role !== "missionary") return "Invitation link";
  return isServeUnderPathsEnabled()
    ? "Missionary workspace invitation link"
    : "Missionary workspace invitation path";
}
