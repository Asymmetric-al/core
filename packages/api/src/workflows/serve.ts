import { serve } from "inngest/next";

import { dispatchRecoveryScan } from "./functions/dispatch-recovery-scan";
import { workflowSmoke } from "./functions/workflow-smoke";
import { inngest } from "./inngest/client";

/**
 * Workflow function serving for the staff operations surface. The app route
 * (`apps/admin/app/api/inngest/route.ts`) re-exports these handlers and stays
 * thin per docs/guides/architecture/data-access-boundary.md.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [workflowSmoke, dispatchRecoveryScan],
});
