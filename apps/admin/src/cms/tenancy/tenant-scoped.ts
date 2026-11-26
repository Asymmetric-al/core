import {
  CANONICAL_UUID,
  checkReferences,
  collectReferences,
  idOf,
} from "./reference-guard";
import { refuse, type FieldRefusal } from "./refusal";
import { readEditingActor } from "../access/tenant-context";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { isServicePortRequest } from "../ports/service-port";

import type {
  Access,
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
  Field,
  PayloadRequest,
} from "payload";

export type DocumentRule = (args: {
  req: PayloadRequest;
  operation: "create" | "update";
  data: Record<string, unknown>;
  merged: Record<string, unknown>;
  originalDoc: Record<string, unknown> | undefined;
  tenant: string;
  asActor: boolean;
}) => Promise<FieldRefusal[]> | FieldRefusal[];

export type TenantScopedOptions = {
  actorCreate: boolean;
  actorUpdate: boolean;
  actorDelete: boolean;
  keepsServiceId: boolean;
  rules?: DocumentRule[];
};

const NO_ACTOR = "Web Studio could not tell who is making this change.";
const FOREIGN_TENANT = "A document stays in the organization it belongs to.";

export function tenantField(): Field {
  return {
    name: "tenant",
    label: "Organization",
    type: "text",
    required: true,
    index: true,
    admin: { hidden: true, readOnly: true },
  };
}

export const tenantScopedAccess: Access = ({ req }) => {
  const actor = readEditingActor(req);
  return actor ? { tenant: { equals: actor.tenantId } } : false;
};

const actorMayCreate: Access = ({ req }) => readEditingActor(req) !== null;
const nobody: Access = () => false;

export function discardSuppliedId(
  keepsServiceId: boolean,
): CollectionBeforeOperationHook {
  return ({ args, operation, req }) => {
    if (operation !== "create") return args;
    const data = (args as { data?: Record<string, unknown> }).data;
    if (
      data &&
      "id" in data &&
      !(keepsServiceId && isServicePortRequest(req))
    ) {
      delete data.id;
    }
    return args;
  };
}

export const keepTenant: CollectionBeforeValidateHook = ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data;
  const actor = readEditingActor(req);
  const service = isServicePortRequest(req);
  if (operation === "create") {
    if (actor) {
      if (data.tenant !== undefined && data.tenant !== actor.tenantId) {
        refuse(req, collection.slug, [
          { path: "tenant", message: FOREIGN_TENANT },
        ]);
      }
      return { ...data, tenant: actor.tenantId };
    }
    if (!service) {
      refuse(req, collection.slug, [{ path: "tenant", message: NO_ACTOR }]);
    }
    if (typeof data.tenant !== "string" || !CANONICAL_UUID.test(data.tenant)) {
      refuse(req, collection.slug, [
        { path: "tenant", message: "The organization ID is not valid." },
      ]);
    }
    return data;
  }
  if (data.tenant !== undefined && data.tenant !== originalDoc?.tenant) {
    refuse(req, collection.slug, [{ path: "tenant", message: FOREIGN_TENANT }]);
  }
  return data;
};

export function guardReferences(
  rules: DocumentRule[] = [],
): CollectionBeforeChangeHook {
  return async ({ collection, data, operation, originalDoc, req }) => {
    const actor = readEditingActor(req);
    const service = isServicePortRequest(req);
    if (!actor && !service) {
      refuse(req, collection.slug, [{ path: "tenant", message: NO_ACTOR }]);
    }
    const original = originalDoc as Record<string, unknown> | undefined;
    const incoming = data as Record<string, unknown>;
    const merged = { ...(original ?? {}), ...incoming };
    const tenantValue =
      operation === "create" ? incoming.tenant : original?.tenant;
    if (typeof tenantValue !== "string") {
      refuse(req, collection.slug, [{ path: "tenant", message: NO_ACTOR }]);
    }
    const tenant = tenantValue;
    const { references, refusals } = collectReferences(
      collection.fields,
      merged,
      (req.payload.config.blocks ?? []) as never,
    );
    refusals.push(
      ...(await checkReferences(req, references, {
        tenant,
        site: idOf(merged.site),
        asActor: actor !== null,
      })),
    );
    for (const rule of rules) {
      refusals.push(
        ...(await rule({
          req,
          operation: operation as "create" | "update",
          data: incoming,
          merged,
          originalDoc: original,
          tenant,
          asActor: actor !== null,
        })),
      );
    }
    if (refusals.length > 0) {
      refuse(req, collection.slug, firstRefusalPerPath(refusals));
    }
    return data;
  };
}

function firstRefusalPerPath(refusals: FieldRefusal[]): FieldRefusal[] {
  const seen = new Set<string>();
  return refusals.filter((refusal) => {
    if (seen.has(refusal.path)) return false;
    seen.add(refusal.path);
    return true;
  });
}

export function tenantScoped(
  config: CollectionConfig,
  options: TenantScopedOptions,
): CollectionConfig {
  return {
    ...config,
    access: {
      ...config.access,
      read: tenantScopedAccess,
      create: options.actorCreate ? actorMayCreate : nobody,
      update: options.actorUpdate ? tenantScopedAccess : nobody,
      delete: options.actorDelete ? tenantScopedAccess : nobody,
    },
    hooks: {
      ...config.hooks,
      beforeOperation: [
        discardSuppliedId(options.keepsServiceId),
        ...(config.hooks?.beforeOperation ?? []),
      ],
      beforeValidate: [keepTenant, ...(config.hooks?.beforeValidate ?? [])],
      beforeChange: [
        guardReferences(options.rules),
        ...(config.hooks?.beforeChange ?? []),
      ],
      afterChange: [...(config.hooks?.afterChange ?? []), logCmsChangeAudit],
      afterDelete: [...(config.hooks?.afterDelete ?? []), logCmsDeleteAudit],
    },
    fields: [tenantField(), ...config.fields],
  };
}
