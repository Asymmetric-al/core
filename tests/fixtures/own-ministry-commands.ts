import { latestBody } from "./pre-membership-commands";
import { ownMinistryEntries } from "../../scripts/verify/command-entry-boundaries.mjs";

export function ownMinistryCommandRows() {
  return ownMinistryEntries.map(({ function: signature }) => ({
    function: signature,
    schema: "tenant_guard",
    owner: "tenant_guard",
    language: "plpgsql",
    definer: true,
    authenticated: true,
    service_role: false,
    anon: false,
    public_execute: false,
    body: latestBody(signature.slice(0, signature.indexOf("("))),
  }));
}

export const OWN_MINISTRY_HELPERS = [
  "tenant_guard.lock_live_assignment(p_ctx tenant_guard.command_context, p_capability text)",
  "tenant_guard.own_ministry(p_ctx tenant_guard.command_context)",
] as const;

export function ownMinistryHelperRows() {
  return OWN_MINISTRY_HELPERS.map((signature) => ({
    function: signature,
    schema: "tenant_guard",
    owner: "postgres",
    language: "plpgsql",
    definer: false,
    authenticated: false,
    service_role: false,
    anon: false,
    public_execute: false,
    body: latestBody(signature.slice(0, signature.indexOf("("))),
  }));
}
