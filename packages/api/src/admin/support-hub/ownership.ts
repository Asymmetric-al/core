import { supportHubAdapter } from "./adapter";
import {
  saveNotificationPreferencesSchema,
  saveSavedViewSchema,
} from "./schemas";

import type {
  SaveNotificationPreferencesInput,
  SaveSavedViewInput,
  SupportHubAdapter,
} from "./adapter";
import type { SupportAgent } from "./adapter/types";
import type { SupportHubContext } from "./route-helpers";

/**
 * Refusals Support Hub routes answer with 403 and this plain message.
 * Messages never say whether another agent's record exists.
 */
export class SupportHubForbiddenError extends Error {
  readonly status = 403;

  constructor(message: string) {
    super(message);
    this.name = "SupportHubForbiddenError";
  }
}

const NOT_AN_AGENT =
  "You aren’t set up as a support agent, so there’s nothing here to change.";
const OTHERS_PREFERENCES =
  "You can only change your own notification preferences.";
const OTHERS_VIEWS = "You can only change your own saved views.";
const WORKSPACE_VIEWS =
  "Only support admins can share a view with the whole workspace.";
const UNKNOWN_AGENT = "Pick a support agent in this workspace.";
const OWNERLESS_PERSONAL_VIEW =
  "A personal view needs an owner who is a support agent.";

type OwnershipAdapter = Pick<
  SupportHubAdapter,
  "agents" | "notificationPreferences" | "savedViews"
>;

/** What the signed-in user may change; the browser uses it to hide what it can't. */
export type SupportSettingsAccess = {
  agentId: string | null;
  canManageAll: boolean;
};

type SupportActor = SupportSettingsAccess & {
  /** Agent ids in the signed-in tenant, for validating chosen owners. */
  tenantAgentIds: ReadonlySet<string>;
};

type SavedViewOwnership = {
  scope: SaveSavedViewInput["scope"];
  ownerAgentId: string | null;
};

/**
 * The one place that matches a signed-in user to a support agent: by user
 * id, or by email when the agent row predates the user's account.
 */
export function matchSupportAgentId(
  agents: readonly Pick<SupportAgent, "id" | "email" | "userId">[],
  context: Pick<SupportHubContext, "userId" | "userEmail">,
): string | null {
  const linked = agents.find((agent) => agent.userId === context.userId);
  if (linked) return linked.id;

  const email = context.userEmail?.trim().toLowerCase() ?? null;
  const match = agents.find(
    (agent) =>
      agent.userId == null &&
      email !== null &&
      agent.email.toLowerCase() === email,
  );
  return match?.id ?? null;
}

/**
 * Who may change what in Support Hub's per-agent settings.
 *
 * Support admins (admin, super_admin) manage everything. Other agents manage
 * only their own notification preferences and their own personal saved
 * views. Workspace views and legacy personal views with no owner stay
 * visible to everyone but are read-only for them. The browser hides what it
 * can't change, but this is the check that counts.
 */
export function createSupportOwnershipService(adapter: OwnershipAdapter) {
  async function resolveActor(
    context: SupportHubContext,
  ): Promise<SupportActor> {
    const agents = await adapter.agents.list();
    return {
      agentId: matchSupportAgentId(agents, context),
      canManageAll: context.canManageAll,
      tenantAgentIds: new Set(agents.map((agent) => agent.id)),
    };
  }

  function describe(actor: SupportActor): SupportSettingsAccess {
    return { agentId: actor.agentId, canManageAll: actor.canManageAll };
  }

  function ownsView(actor: SupportActor, view: SavedViewOwnership): boolean {
    return (
      actor.agentId !== null &&
      view.scope === "personal" &&
      view.ownerAgentId === actor.agentId
    );
  }

  async function findView(id: string) {
    const views = await adapter.savedViews.list();
    return views.find((view) => view.id === id) ?? null;
  }

  function requireTenantAgent(actor: SupportActor, agentId: string | null) {
    if (agentId !== null && !actor.tenantAgentIds.has(agentId)) {
      throw new SupportHubForbiddenError(UNKNOWN_AGENT);
    }
  }

  return {
    async describeAccess(
      context: SupportHubContext,
    ): Promise<SupportSettingsAccess> {
      return describe(await resolveActor(context));
    },

    async listNotificationPreferences(context: SupportHubContext) {
      const [actor, preferences] = await Promise.all([
        resolveActor(context),
        adapter.notificationPreferences.list(),
      ]);
      if (actor.canManageAll) return preferences;
      return preferences.filter(
        (preference) =>
          actor.agentId !== null && preference.agentId === actor.agentId,
      );
    },

    async saveNotificationPreferences(
      context: SupportHubContext,
      input: SaveNotificationPreferencesInput,
    ) {
      const parsed = saveNotificationPreferencesSchema.parse(input);
      const actor = await resolveActor(context);
      if (actor.canManageAll) {
        requireTenantAgent(actor, parsed.agentId);
      } else {
        if (!actor.agentId) throw new SupportHubForbiddenError(NOT_AN_AGENT);
        if (parsed.agentId !== actor.agentId) {
          throw new SupportHubForbiddenError(OTHERS_PREFERENCES);
        }
      }
      return adapter.notificationPreferences.save(parsed);
    },

    async listSavedViews(context: SupportHubContext) {
      const [actor, views] = await Promise.all([
        resolveActor(context),
        adapter.savedViews.list(),
      ]);
      if (actor.canManageAll) return views;
      // Shared views, legacy ownerless views, and the agent's own.
      return views.filter(
        (view) =>
          view.scope === "workspace" ||
          view.ownerAgentId === null ||
          (actor.agentId !== null && view.ownerAgentId === actor.agentId),
      );
    },

    async saveSavedView(context: SupportHubContext, input: SaveSavedViewInput) {
      const parsed = saveSavedViewSchema.parse(input);
      const actor = await resolveActor(context);

      if (actor.canManageAll) {
        // A personal view always has an owner: default to the saver. One
        // with no owner would show to everyone, so it isn't personal.
        const ownerAgentId =
          parsed.scope === "personal"
            ? (parsed.ownerAgentId ?? actor.agentId)
            : parsed.ownerAgentId;
        if (parsed.scope === "personal" && ownerAgentId === null) {
          throw new SupportHubForbiddenError(OWNERLESS_PERSONAL_VIEW);
        }
        requireTenantAgent(actor, ownerAgentId);
        return adapter.savedViews.save({ ...parsed, ownerAgentId });
      }

      if (!actor.agentId) throw new SupportHubForbiddenError(NOT_AN_AGENT);
      if (parsed.scope === "workspace") {
        throw new SupportHubForbiddenError(WORKSPACE_VIEWS);
      }
      if (
        parsed.ownerAgentId !== null &&
        parsed.ownerAgentId !== actor.agentId
      ) {
        throw new SupportHubForbiddenError(OTHERS_VIEWS);
      }
      if (parsed.id) {
        const existing = await findView(parsed.id);
        if (!existing || !ownsView(actor, existing)) {
          throw new SupportHubForbiddenError(OTHERS_VIEWS);
        }
        // The write repeats the ownership condition, so a transfer that lands
        // between this check and the write is refused, not overwritten.
        const updated = await adapter.savedViews.updateIfOwned(
          { ...parsed, id: parsed.id, ownerAgentId: actor.agentId },
          actor.agentId,
        );
        if (!updated) throw new SupportHubForbiddenError(OTHERS_VIEWS);
        return updated;
      }
      return adapter.savedViews.save({
        ...parsed,
        ownerAgentId: actor.agentId,
      });
    },

    async deleteSavedView(context: SupportHubContext, id: string) {
      const actor = await resolveActor(context);
      if (!actor.canManageAll) {
        if (!actor.agentId) throw new SupportHubForbiddenError(NOT_AN_AGENT);
        const existing = await findView(id);
        if (!existing || !ownsView(actor, existing)) {
          throw new SupportHubForbiddenError(OTHERS_VIEWS);
        }
        if (!(await adapter.savedViews.deleteIfOwned(id, actor.agentId))) {
          throw new SupportHubForbiddenError(OTHERS_VIEWS);
        }
        return;
      }
      await adapter.savedViews.delete(id);
    },
  };
}

/** Ownership-checked reads and writes for per-agent Support Hub settings. */
export const supportHubOwnership =
  createSupportOwnershipService(supportHubAdapter);
