import { POST as signInDemoAccount } from "@asym/api/auth/demo-account";

import { withClipboardReset } from "@/src/cms/clipboard-reset";

export { GET } from "@asym/api/auth/demo-account";

export const POST = withClipboardReset(signInDemoAccount);
