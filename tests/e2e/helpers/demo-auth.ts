export type DemoAvailabilityPayload = {
  roles?: Record<string, boolean>;
  availableRoles?: Record<string, boolean>;
};

export function getDemoRoleMap(
  payload: DemoAvailabilityPayload,
): Record<string, boolean> | undefined {
  return payload.availableRoles ?? payload.roles;
}
