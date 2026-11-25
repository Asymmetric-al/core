export type PageCopy = {
  method: string;
  url: string;
  status: number;
  text: string;
  done: boolean;
  error?: string;
};

export type ReceivedBody = { url: string; status: number } & (
  { text: string } | { unread: string } | { leftWithItsDocument: true }
);

export function bodyFromPageCopy(
  response: { url: string; status: number },
  copy: PageCopy | undefined,
): ReceivedBody {
  if (!copy) return { ...response, unread: "no copy of it in the page" };
  if (copy.error !== undefined) {
    return { ...response, unread: `the page's read failed: ${copy.error}` };
  }
  if (!copy.done) {
    return { ...response, unread: "the page had not received it whole" };
  }
  return { ...response, text: copy.text };
}
