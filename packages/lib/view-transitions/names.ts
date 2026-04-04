/**
 * Deterministic `name` props for `<ViewTransition name={...}>`.
 * Keep stable between list and detail (same id on both routes).
 */

export function workerHeroImageTransitionName(workerId: string): string {
  return `worker-hero:${workerId}`;
}

export function workerAvatarTransitionName(workerId: string): string {
  return `worker-avatar:${workerId}`;
}

export function workerTitleTransitionName(workerId: string): string {
  return `worker-title:${workerId}`;
}

export function crmRecordTitleTransitionName(recordId: string): string {
  return `crm-record-title:${recordId}`;
}

export function crmRecordAvatarTransitionName(recordId: string): string {
  return `crm-record-avatar:${recordId}`;
}

/** Stable across shell + profile edit when user id is unknown in the shell demo. */
export const MISSIONARY_SHELL_AVATAR_VT_NAME =
  "missionary-shell-avatar" as const;

/** Settings page title block ↔ other surfaces if needed later. */
export const MISSIONARY_SETTINGS_HEADER_VT_NAME =
  "missionary-settings-header" as const;
