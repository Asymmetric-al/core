import { POST as signIn } from "@asym/api/auth/sign-in";

import { withClipboardReset } from "@/src/cms/clipboard-reset";

export const POST = withClipboardReset(signIn);
