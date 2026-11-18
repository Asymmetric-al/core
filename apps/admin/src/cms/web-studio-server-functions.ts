import { buildFormStateHandler } from "@payloadcms/ui/utilities/buildFormState";

import { withoutLockStatus } from "./document-locks";

/**
 * The server functions Web Studio overrides in Payload's registry, passed to
 * `handleServerFunctions` by the Payload layout (AL-2675, council C3):
 * `form-state` without document locks (`document-locks.ts`). Every other
 * function is Payload's own.
 */
export const webStudioServerFunctions = {
  "form-state": withoutLockStatus(buildFormStateHandler),
};
