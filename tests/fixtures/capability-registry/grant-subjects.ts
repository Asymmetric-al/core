import { ROLE_DEFAULT_BUNDLES } from "../../../packages/auth/capabilities/bundles";

import type {
  BundleKey,
  GrantSubjectKey,
} from "../../../packages/auth/capabilities/bundles";

/* A subject (as from a new StaffSubrole) without a default entry fails. */
type Subjects = GrantSubjectKey | "staff:chaplain";
type Bundles = readonly BundleKey[];
export const defaults: Record<Subjects, Bundles> = ROLE_DEFAULT_BUNDLES; // error TS2741

export const unknownBundle: readonly BundleKey[] = ["finance_superuser"]; // error TS2322
