import { POST as signIn } from "@asym/api/auth/sign-in";

import { clipboardResetCookie } from "@/src/cms/clipboard-reset";

export async function POST(request: Request) {
  const response = await signIn(request);
  if (response.status === 200) response.cookies.set(clipboardResetCookie());
  return response;
}
