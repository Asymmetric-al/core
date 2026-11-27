import { GET as completeSignIn } from "@asym/api/auth/callback";

import { withClipboardReset } from "@/src/cms/clipboard-reset";

export const GET = withClipboardReset(completeSignIn);
