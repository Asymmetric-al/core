import { membershipHasCapability } from "@asym/auth/context";

import type { StaffSubrole } from "@asym/database/types";
import type { PayloadRequest } from "payload";

export const PRINCIPAL_LINKS_SLUG = "principal-links";

export type CmsActor = {
  userId: string;
  tenantId: string;
  assignmentId: string;
  staffRole: StaffSubrole | null;
  isTenantAdmin: boolean;
};

type TenantContext = {
  isAuthenticated: boolean;
  userId: string | null;
  tenantId: string | null;
  assignmentId: string | null;
  staffRole: StaffSubrole | null;
  isTenantAdmin: boolean;
};

type CmsRequestUser = {
  id?: unknown;
  collection?: unknown;
  tenantId?: unknown;
  assignmentId?: unknown;
  staffRole?: unknown;
  isTenantAdmin?: unknown;
};

const text = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

export function getTenantContext(req: PayloadRequest): TenantContext {
  const user = (req.user ?? null) as CmsRequestUser | null;
  const userId = text(user?.id);
  return {
    isAuthenticated: userId !== null,
    userId,
    tenantId: text(user?.tenantId),
    assignmentId: text(user?.assignmentId),
    staffRole: (text(user?.staffRole) as StaffSubrole | null) ?? null,
    isTenantAdmin: user?.isTenantAdmin === true,
  };
}

export function readCmsActor(req: PayloadRequest): CmsActor | null {
  const user = (req.user ?? null) as CmsRequestUser | null;
  if (!user || user.collection !== PRINCIPAL_LINKS_SLUG) return null;
  const context = getTenantContext(req);
  if (!context.userId || !context.tenantId || !context.assignmentId) {
    return null;
  }
  return {
    userId: context.userId,
    tenantId: context.tenantId,
    assignmentId: context.assignmentId,
    staffRole: context.staffRole,
    isTenantAdmin: context.isTenantAdmin,
  };
}

export function canEditWebStudio(actor: CmsActor | null): actor is CmsActor {
  return (
    actor !== null &&
    membershipHasCapability(
      {
        tenantId: actor.tenantId,
        role: "staff",
        staffRole: actor.staffRole,
        isActive: true,
        isTenantAdmin: actor.isTenantAdmin,
      },
      "web_studio.edit",
    )
  );
}

export function readEditingActor(req: PayloadRequest): CmsActor | null {
  const actor = readCmsActor(req);
  return canEditWebStudio(actor) ? actor : null;
}
