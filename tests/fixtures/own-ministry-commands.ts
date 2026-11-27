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
