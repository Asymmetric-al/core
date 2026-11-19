// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

/**
 * Check of the fix lists, JR1: once a Web Studio document's scope is retired
 * (here, another person signed in in another tab), its calls to Payload's
 * REST routes and its server functions are not sent at all. Sent without the
 * document's claims, the server would act for the person signed in now, in
 * the organization the Web Studio cookie selects for them. Each answers the
 * refusal the platform's wrappers give, made in the browser.
 */

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument,
  loadDocument: vi.fn(),
}));

const PERSON_A = "00000000-0000-4000-8000-0000000000c1";
const PERSON_B = "00000000-0000-4000-8000-0000000000c2";
const SCOPE = {
  userId: PERSON_A,
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-0000000000b1",
  addressPrefix: "",
};

/**
 * The configured project's session cookie, named as supabase-js names it
 * (`sb-<first label of the project's host>-auth-token`); only this one says
 * who is signed in (last read of the first release, L2).
 */
const SESSION_COOKIE = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0]}-auth-token`;

/** The browser client's session cookie for `userId`, as @supabase/ssr writes it. */
function signInBrowserAs(userId: string) {
  const json = JSON.stringify({ access_token: "t", user: { id: userId } });
  const value = `base64-${Buffer.from(json).toString("base64url")}`;
  document.cookie = `${SESSION_COOKIE}=${value}; path=/`;
}

const sent: string[] = [];
const underlyingFetch = vi.fn(async (input: RequestInfo | URL) => {
  sent.push(
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url,
  );
  return new Response("{}", { status: 200 });
});
const originalFetch = window.fetch;

beforeAll(() => {
  window.history.replaceState(null, "", "/web-studio/collections/pages");
  window.fetch = underlyingFetch as typeof fetch;
  window.sessionStorage.clear();
});
afterAll(() => {
  cleanup();
  window.fetch = originalFetch;
  document.cookie = `${SESSION_COOKIE}=; max-age=0; path=/`;
});

it("sends no REST call and no server function once another person signed in, and answers the refusal in the browser", async () => {
  signInBrowserAs(PERSON_A);
  const { WebStudioDocument } =
    await import("../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document");
  render(
    <WebStudioDocument
      scope={SCOPE}
      organization={{
        name: "Bravo Mission",
        canSwitch: true,
        missionControlHref: "/00000000-0000-0000-0000-000000000002",
      }}
    >
      <p>pages of Bravo Mission</p>
    </WebStudioDocument>,
  );
  expect(screen.getByText("pages of Bravo Mission")).toBeTruthy();

  signInBrowserAs(PERSON_B);
  const answers: Response[] = [];
  await act(async () => {
    answers.push(
      await window.fetch("/web-studio/api/pages/7?draft=true", {
        method: "PATCH",
        body: "{}",
      }),
    );
    answers.push(
      await window.fetch("/web-studio/collections/pages/7", {
        method: "POST",
        headers: { "next-action": "abc123" },
        body: "[]",
      }),
    );
  });

  expect(sent).toEqual([]);
  for (const answer of answers) {
    expect(answer.status).toBe(401);
    expect(answer.headers.get("x-asym-scope-refused")).toBe("retired");
  }
  expect(screen.queryByText("pages of Bravo Mission")).toBeNull();
  expect(reloadDocument).toHaveBeenCalledTimes(1);

  // A navigation of the document's own (its reload, a page request) is not
  // a scoped call and still goes out.
  await window.fetch("/web-studio/collections/pages");
  expect(sent).toEqual(["/web-studio/collections/pages"]);
});
