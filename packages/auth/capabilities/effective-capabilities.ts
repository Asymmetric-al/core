import { CAPABILITY_BUNDLES, ROLE_DEFAULT_BUNDLES } from "./bundles";
import { CapabilityResolutionError } from "./errors";
import { deepFreeze } from "./freeze";

import type { BundleKey, GrantSubjectKey, NamedGrantSubject } from "./bundles";
import type { CapabilityResolutionErrorCode } from "./errors";
import type { Capability } from "./registry";
import type { MembershipRole, StaffSubrole } from "@asym/database/types";

/** The one membership assignment selected for this context. */
export type AssignmentGrantSource = {
  readonly kind: "assignment";
  readonly assignmentId: string;
  readonly tenantId: string;
  readonly role: MembershipRole;
  readonly staffRole: StaffSubrole | null;
  /**
   * A suspended assignment or grant is issued with this set to `false`, never
   * omitted. Any inactive source fails the whole context with `inactive_source`.
   */
  readonly isActive: boolean;
};

/** A grant issued to a named subject (issuers: #2284 and #2281). */
export type NamedGrantSource = {
  readonly kind: "named";
  readonly grantId: string;
  readonly tenantId: string;
  readonly subject: NamedGrantSubject;
  /**
   * A suspended assignment or grant is issued with this set to `false`, never
   * omitted. Any inactive source fails the whole context with `inactive_source`.
   */
  readonly active: boolean;
};

export type GrantSource = AssignmentGrantSource | NamedGrantSource;

/**
 * One selected context: at most one assignment plus named grants, all for
 * the same tenant. Other memberships, hats and profile roles have no slot.
 */
export type SelectedGrantContext = {
  readonly tenantId: string;
  readonly sources: readonly GrantSource[];
};

/** Reserved for Phase 12 tenant overrides; only `undefined` is accepted. */
export type DormantTenantOverrides = undefined;

/**
 * Bundles for an assignment without a staff subrole, by membership role.
 * Staff with no subrole keep today's donor-care tier only; this is code-only
 * and deliberately not a grant subject.
 */
const UNSPECIALIZED_ASSIGNMENT_BUNDLES: Readonly<
  Record<MembershipRole, readonly BundleKey[]>
> = deepFreeze({
  donor: ROLE_DEFAULT_BUNDLES["member:donor"],
  missionary: ROLE_DEFAULT_BUNDLES["member:missionary"],
  staff: ["donor_care"],
});

const NAMED_SUBJECTS: Readonly<Record<NamedGrantSubject, GrantSubjectKey>> =
  deepFreeze({
    tenant_admin: "tenant_admin",
    platform_admin: "platform_admin",
  });

/** A source's fields, each read exactly once into a plain object. */
type SourceSnapshot =
  | {
      readonly kind: "assignment";
      readonly tenantId: unknown;
      readonly active: unknown;
      readonly role: unknown;
      readonly staffRole: unknown;
    }
  | {
      readonly kind: "named";
      readonly tenantId: unknown;
      readonly active: unknown;
      readonly subject: unknown;
    };

function fail(code: CapabilityResolutionErrorCode): never {
  throw new CapabilityResolutionError(code);
}

/** Own-key Record lookup; prototype keys and non-strings never match. */
function lookup<T>(table: Readonly<Record<string, T>>, key: unknown) {
  return typeof key === "string" && Object.hasOwn(table, key)
    ? table[key]
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function snapshotSource(source: unknown): SourceSnapshot {
  if (!isRecord(source)) fail("missing_context");
  const { kind, tenantId } = source;
  if (kind === "assignment") {
    const { role, staffRole, isActive: active } = source;
    return { kind, tenantId, active, role, staffRole };
  }
  if (kind !== "named") fail("missing_context");
  const { subject, active } = source;
  return { kind, tenantId, active, subject };
}

/**
 * Reads the context and each source once, so accessors cannot change a value
 * between validation and the union. Malformed input is `missing_context`.
 */
function snapshotContext(context: unknown) {
  if (!isRecord(context)) fail("missing_context");
  const { tenantId, sources } = context;
  if (typeof tenantId !== "string" || tenantId === "") fail("missing_context");
  if (!Array.isArray(sources)) fail("missing_context");
  const snapshots: SourceSnapshot[] = [];
  const { length } = sources;
  for (let index = 0; index < length; index += 1)
    snapshots.push(snapshotSource(sources[index]));
  return { tenantId, sources: snapshots };
}

type AssignmentSnapshot = Extract<SourceSnapshot, { kind: "assignment" }>;

function assignmentBundles({ role, staffRole }: AssignmentSnapshot) {
  // A subrole is null or a primitive string; anything else is never coerced.
  if (staffRole !== null && typeof staffRole !== "string") return undefined;
  const unspecialized = lookup(UNSPECIALIZED_ASSIGNMENT_BUNDLES, role);
  if (unspecialized === undefined || staffRole === null) return unspecialized;
  return lookup(ROLE_DEFAULT_BUNDLES, `${role}:${staffRole}`);
}

function bundlesFor(source: SourceSnapshot): readonly BundleKey[] {
  const bundles =
    source.kind === "named"
      ? lookup(ROLE_DEFAULT_BUNDLES, lookup(NAMED_SUBJECTS, source.subject))
      : assignmentBundles(source);
  return bundles ?? fail("unknown_subject");
}

/**
 * Union of the default bundles of every source in one selected context.
 * Validation runs in full before any union, so a bad source yields an error
 * and never a partial result. Foreign tenancy is checked before revocation
 * so another tenant's revocation state is never revealed.
 */
export function resolveEffectiveCapabilities(
  context: SelectedGrantContext,
  tenantOverrides?: DormantTenantOverrides,
): readonly Capability[] {
  if (tenantOverrides !== undefined) fail("tenant_overrides_dormant");
  const { tenantId, sources } = snapshotContext(context);
  if (sources.some((source) => source.tenantId !== tenantId))
    fail("foreign_tenant");
  if (!sources.every((source) => source.active === true))
    fail("inactive_source");
  if (sources.filter((source) => source.kind === "assignment").length > 1)
    fail("multiple_assignments");

  const capabilities = new Set<Capability>();
  for (const bundle of sources.flatMap(bundlesFor))
    for (const capability of CAPABILITY_BUNDLES[bundle])
      capabilities.add(capability);
  return Object.freeze([...capabilities].sort());
}
