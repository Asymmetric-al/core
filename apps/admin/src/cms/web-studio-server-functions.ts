import { buildFormStateHandler } from "@payloadcms/ui/utilities/buildFormState";

import { withOrganizationLocks } from "./document-locks";

/**
 * The server functions Web Studio overrides in Payload's registry, passed to
 * `handleServerFunctions` by the Payload layout (AL-2675, council C3 and
 * round 2 CR2): `form-state`, which locks a document only inside the
 * organization the person selected (`document-locks.ts`). Every other
 * function is Payload's own.
 */
export const webStudioServerFunctions = {
  "form-state": withOrganizationLocks(buildFormStateHandler),
};
