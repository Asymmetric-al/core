import { clipboardResetCookie } from "@asym/auth/clipboard-reset";

import type { NextResponse } from "next/server";

export {
  CLIPBOARD_RESET_COOKIE,
  clipboardResetCookie,
} from "@asym/auth/clipboard-reset";

export function withClipboardReset<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    const response = await handler(...args);
    response.cookies.set(clipboardResetCookie());
    return response;
  };
}
