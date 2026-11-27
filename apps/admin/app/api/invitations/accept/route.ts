import { POST as acceptInvitation } from "@asym/api/invitations/accept";

import { withClipboardReset } from "@/src/cms/clipboard-reset";

export const POST = withClipboardReset(acceptInvitation);
