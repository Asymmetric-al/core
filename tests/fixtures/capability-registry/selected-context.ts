import { resolveEffectiveCapabilities as resolve } from "../../../packages/auth/capabilities/effective-capabilities";

import type { SelectedGrantContext } from "../../../packages/auth/capabilities/effective-capabilities";
import type { RoleSnapshot } from "../../../packages/auth/permissions";

declare const snapshot: RoleSnapshot;

export const ok = resolve({ tenantId: "t", sources: [] });
export const fromSnapshot: SelectedGrantContext = snapshot; // error TS2739
export const withMemberships = resolve({
  tenantId: "t",
  sources: [],
  memberships: snapshot.memberships, // error TS2353
});
export const withProfileRole = resolve({
  tenantId: "t",
  sources: [],
  profileRole: "admin", // error TS2353
});
export const adminRole = resolve({
  tenantId: "t",
  sources: [
    {
      kind: "assignment",
      assignmentId: "a",
      tenantId: "t",
      role: "admin", // error TS2322
      staffRole: null,
      isActive: true,
    },
  ],
});

export const dormant = resolve({ tenantId: "t", sources: [] }, undefined);
export const overridden = resolve({ tenantId: "t", sources: [] }, {}); // error TS2345
