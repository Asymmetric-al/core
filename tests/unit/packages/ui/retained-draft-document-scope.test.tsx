/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Council round 1, A13: in Mission Control and the missionary workspace the
 * document scope is the page's tenant for retained drafts; the layout no
 * longer publishes a second copy of it. The donor portal fixes a document
 * scope too (`PortalDocument`), so nothing publishes a copy (JB10).
 */

vi.mock("@asym/auth/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-one" },
    profile: { id: "profile-one", tenant_id: "profile-column", role: "x" },
    loading: false,
  }),
}));

const SCOPE = {
  userId: "user-one",
  tenantId: "00000000-0000-0000-0000-000000000001",
  assignmentId: "00000000-0000-4000-8000-000000000101",
  addressPrefix: "/00000000-0000-0000-0000-000000000001",
};

async function load() {
  vi.resetModules();
  const scope = await import("../../../../packages/database/document-scope");
  const drafts = await import("../../../../packages/ui/hooks/retained-draft");
  return { ...scope, ...drafts };
}

function beforeUnload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

afterEach(cleanup);

describe("retained drafts in a document with a scope", () => {
  it("are owned by the document scope's tenant, with no page tenant published", async () => {
    const {
      DocumentScopeProvider,
      SessionRetainedDraftProvider,
      useRetainedDraft,
    } = await load();
    function Editor() {
      const draft = useRetainedDraft<{ text: string }>("scoped-editor");
      return (
        <input
          aria-label="Draft"
          value={draft.value?.text ?? ""}
          onChange={(event) => draft.update({ text: event.target.value })}
        />
      );
    }

    render(
      <SessionRetainedDraftProvider>
        <DocumentScopeProvider scope={SCOPE}>
          <Editor />
        </DocumentScopeProvider>
      </SessionRetainedDraftProvider>,
    );
    fireEvent.change(screen.getByLabelText("Draft"), {
      target: { value: "In the document's tenant" },
    });

    expect(beforeUnload()).toBe(true);
  });

  it("stay unowned when the document scope is another person's", async () => {
    const {
      DocumentScopeProvider,
      SessionRetainedDraftProvider,
      useRetainedDraft,
    } = await load();
    function Editor() {
      const draft = useRetainedDraft<{ text: string }>("scoped-editor");
      return (
        <input
          aria-label="Draft"
          value={draft.value?.text ?? ""}
          onChange={(event) => draft.update({ text: event.target.value })}
        />
      );
    }

    render(
      <SessionRetainedDraftProvider>
        <DocumentScopeProvider scope={{ ...SCOPE, userId: "someone-else" }}>
          <Editor />
        </DocumentScopeProvider>
      </SessionRetainedDraftProvider>,
    );
    fireEvent.change(screen.getByLabelText("Draft"), {
      target: { value: "Not this person's" },
    });

    expect(beforeUnload()).toBe(false);
  });
});
