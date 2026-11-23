import { CAPABILITY_BUNDLES, ROLE_DEFAULT_BUNDLES } from "./bundles";
import { CAPABILITY_REGISTRY } from "./registry";

import type { GrantSubjectKey } from "./bundles";
import type { Capability, CapabilityMeta } from "./registry";

export type CapabilityRow = { readonly key: Capability } & CapabilityMeta;

export type RoleGrantRow = {
  readonly subject: GrantSubjectKey;
  readonly capability: Capability;
};

export type CapabilityRegistryRows = {
  readonly capabilities: readonly CapabilityRow[];
  readonly roleGrants: readonly RoleGrantRow[];
};

const sortedKeys = <K extends string>(record: Readonly<Record<K, unknown>>) =>
  (Object.keys(record) as K[]).sort();

export function capabilityRegistryRows(): CapabilityRegistryRows {
  const capabilities = sortedKeys(CAPABILITY_REGISTRY).map((key) => {
    const { label, description, domain, source } = CAPABILITY_REGISTRY[key];
    return { key, label, description, domain, source };
  });

  const roleGrants = sortedKeys(ROLE_DEFAULT_BUNDLES).flatMap((subject) => {
    const granted = ROLE_DEFAULT_BUNDLES[subject].flatMap(
      (bundle) => CAPABILITY_BUNDLES[bundle],
    );
    return [...new Set(granted)]
      .sort()
      .map((capability) => ({ subject, capability }));
  });

  return { capabilities, roleGrants };
}
