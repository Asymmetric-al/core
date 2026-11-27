import { GET as completeRecovery } from "@asym/api/auth/password-recovery";

import { withClipboardReset } from "@/src/cms/clipboard-reset";

export const GET = withClipboardReset(completeRecovery);
