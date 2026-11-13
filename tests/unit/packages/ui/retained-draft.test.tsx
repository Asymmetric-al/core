/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Activity, StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { signOutClientSession } from "@asym/auth/client-session";
import {
  RetainedDraftProvider,
  SessionRetainedDraftProvider,
  useRetainedDraft,
} from "../../../../packages/ui/hooks/retained-draft";
import type { RetainedDraftSave } from "../../../../packages/ui/hooks/retained-draft";

vi.mock("@asym/auth/use-auth", () => ({
  useAuth: () => ({
    user: { id: "user-one" },
    profile: { id: "profile-one", tenant_id: "tenant-one", role: "admin" },
    loading: false,
  }),
}));

const owner = {
  userId: "user-one",
  tenantId: "tenant-one",
  contextId: "profile-one",
};
let draft: ReturnType<typeof useRetainedDraft<{ text: string }>>;

function Editor() {
  draft = useRetainedDraft<{ text: string }>("test-editor");
  return (
    <input
      aria-label="Draft"
      value={draft.value?.text ?? ""}
      onChange={(event) => draft.update({ text: event.target.value })}
    />
  );
}
function View({
  route = 0,
  user = owner,
  writable = true,
  hidden = false,
}: {
  route?: number;
  user?: typeof owner | null;
  writable?: boolean;
  hidden?: boolean;
}) {
  return (
    <RetainedDraftProvider owner={user} writable={writable}>
      {route === 0 ? (
        <Activity mode={hidden ? "hidden" : "visible"}>
          <Editor />
        </Activity>
      ) : (
        <p>Route {route}</p>
      )}
    </RetainedDraftProvider>
  );
}
function beforeUnload() {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}
afterEach(cleanup);
describe("provider-owned retained drafts", () => {
  it("retains an authenticated owner's draft without inferring access from their base profile role", () => {
    render(
      <SessionRetainedDraftProvider>
        <Editor />
      </SessionRetainedDraftProvider>,
    );
    fireEvent.change(screen.getByLabelText("Draft"), {
      target: { value: "Membership-authorized owner" },
    });
    expect(screen.getByLabelText("Draft")).toHaveProperty(
      "value",
      "Membership-authorized owner",
    );
    expect(beforeUnload()).toBe(true);
  });
  it("restores after unmount and five intervening SPA routes", () => {
    const view = render(<View />);
    fireEvent.change(screen.getByLabelText("Draft"), {
      target: { value: "Keep this" },
    });
    for (let route = 1; route <= 5; route += 1)
      view.rerender(<View route={route} />);
    expect(beforeUnload()).toBe(true);
    view.rerender(<View />);
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "Keep this");
  });
  it("protects hidden Activity drafts and saving after explicit discard", () => {
    const view = render(<View />);
    expect(beforeUnload()).toBe(false);
    act(() => draft.update({ text: "Unsaved" }));
    let save: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      save = draft.beginSave();
      draft.discard();
    });
    view.rerender(<View hidden />);
    expect(beforeUnload()).toBe(true);
    act(() => draft.finishSave(save!, false));
    expect(beforeUnload()).toBe(false);
  });
  it.each(["userId", "tenantId", "contextId"] as const)(
    "purges on %s changes and rejects late owner writes",
    (field) => {
      const view = render(<View />);
      act(() => draft.update({ text: "Private" }));
      const oldDraft = draft;
      let save: RetainedDraftSave<{ text: string }> | null = null;
      act(() => {
        save = draft.beginSave();
      });
      view.rerender(<View user={{ ...owner, [field]: "other" }} />);
      act(() => draft.update({ text: "New owner" }));
      act(() => {
        oldDraft.update({ text: "Late" });
        oldDraft.finishSave(save!, true);
      });
      expect(screen.getByLabelText("Draft")).toHaveProperty(
        "value",
        "New owner",
      );
      view.rerender(<View />);
      expect(screen.getByLabelText("Draft")).toHaveProperty("value", "");
    },
  );
  it("purges when read context disappears while unmounted", () => {
    const view = render(<View />);
    act(() => draft.update({ text: "Private" }));
    view.rerender(<View route={4} user={null} />);
    expect(beforeUnload()).toBe(false);
    view.rerender(<View />);
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "");
  });
  it("keeps clean composer context without prompting and fences automatic saves after rights loss", () => {
    const view = render(<View />);
    act(() => draft.update({ text: "Saved context" }, { dirty: false }));
    expect(beforeUnload()).toBe(false);
    act(() => draft.update({ text: "Edited" }));
    view.rerender(<View writable={false} />);
    view.rerender(<View route={4} />);
    view.rerender(<View />);
    expect(draft.beginSave({ automatic: true })).toBeNull();
    act(() => draft.update({ text: "Explicit edit" }));
    let save: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      save = draft.beginSave({ automatic: true });
    });
    expect(save).not.toBeNull();
    act(() => draft.finishSave(save!, true, undefined, { retain: true }));
    expect(draft.value).toEqual({ text: "Explicit edit" });
    expect(draft.dirty).toBe(false);
    expect(beforeUnload()).toBe(false);
  });
  it("clears read-revoked content and refuses late responses", () => {
    render(<View />);
    act(() => draft.update({ text: "Private" }));
    let save: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      save = draft.beginSave();
      draft.revokeRead();
    });
    expect(draft.canRead).toBe(false);
    expect(draft.value).toBeNull();
    expect(save!.isCurrent()).toBe(false);
    act(() => draft.finishSave(save!, true));
    expect(beforeUnload()).toBe(false);
  });
  it("allows manual publish behind autosave but not duplicate manual saves after eviction", () => {
    const view = render(<View />);
    act(() => draft.update({ text: "Writing" }));
    let autosave: RetainedDraftSave<{ text: string }> | null = null;
    let manual: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      autosave = draft.beginSave({ automatic: true });
      manual = draft.beginSave();
    });
    expect(manual).not.toBeNull();
    view.rerender(<View route={4} />);
    view.rerender(<View />);
    expect(draft.beginSave()).toBeNull();
    act(() => {
      draft.finishSave(autosave!, false);
      draft.finishSave(manual!, false);
    });
  });
  it("keeps failed or conflicted saves", () => {
    render(<View />);
    act(() => draft.update({ text: "Conflict" }));
    let save: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      save = draft.beginSave();
    });
    act(() => draft.finishSave(save!, false));
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "Conflict");
    expect(beforeUnload()).toBe(true);
  });
  it("acknowledges only the saved revision, never newer edits", () => {
    render(<View />);
    act(() => draft.update({ text: "One" }));
    let save: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      save = draft.beginSave();
      draft.update({ text: "Two" });
    });
    act(() => draft.finishSave(save!, true));
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "Two");
    act(() => {
      const latest = draft.beginSave();
      draft.finishSave(latest!, true);
    });
    expect(beforeUnload()).toBe(false);
  });
  it("protects newer edits reverted to an older baseline while saving", () => {
    render(<View />);
    act(() => draft.update({ text: "Saving" }));
    let save: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      save = draft.beginSave();
      draft.update({ text: "Original" }, { dirty: false });
    });
    act(() => draft.finishSave(save!, true));
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "Original");
    expect(draft.dirty).toBe(true);
    expect(beforeUnload()).toBe(true);
  });
  it("fences explicit discard and replacement from late save completion", () => {
    render(<View />);
    act(() => draft.update({ text: "Discarded" }));
    let save: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      save = draft.beginSave();
      draft.discard();
      draft.update({ text: "Replacement" });
    });
    expect(save!.isCurrent()).toBe(false);
    act(() => draft.finishSave(save!, true));
    expect(screen.getByLabelText("Draft")).toHaveProperty(
      "value",
      "Replacement",
    );
  });
  it("disables submission on lost rights without submitting on regain", () => {
    const view = render(<View />);
    act(() => draft.update({ text: "Readable" }));
    let pending: RetainedDraftSave<{ text: string }> | null = null;
    act(() => {
      pending = draft.beginSave();
    });
    expect(pending!.canDispatch()).toBe(true);
    view.rerender(<View writable={false} />);
    expect(pending!.canDispatch()).toBe(false);
    expect(draft.canWrite).toBe(false);
    expect(draft.beginSave()).toBeNull();
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "Readable");
    view.rerender(<View />);
    expect(pending!.canDispatch()).toBe(false);
    expect(draft.isSaving).toBe(false);
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "Readable");
  });
  it("purges synchronously before browser signout cleanup fails", async () => {
    render(<View />);
    act(() => draft.update({ text: "Private" }));
    const browserCleanup = vi.fn(async () => {
      expect(beforeUnload()).toBe(false);
      expect(draft.read()).toBeNull();
      throw new Error("Browser cleanup failed");
    });
    await act(async () => {
      await signOutClientSession({
        signOutOnServer: async () => ({ ok: true }),
        createClient: () => ({ auth: { signOut: browserCleanup } }) as never,
        logger: { warn: vi.fn() },
        redirect: vi.fn(),
      });
    });
    expect(browserCleanup).toHaveBeenCalledOnce();
    act(() => draft.update({ text: "Late" }));
    expect(draft.value).toBeNull();
  });
  it("does not let a previous owner logout purge the new owner", async () => {
    const view = render(<View />);
    let resolveSignOut!: (result: { ok: true }) => void;
    const browserCleanup = vi.fn(async () => ({ error: null }));
    const redirect = vi.fn();
    const pending = signOutClientSession({
      signOutOnServer: () =>
        new Promise((resolve) => {
          resolveSignOut = resolve;
        }),
      createClient: () => ({ auth: { signOut: browserCleanup } }) as never,
      redirect,
      logger: { warn: vi.fn() },
    });
    view.rerender(<View user={{ ...owner, userId: "new-user" }} />);
    act(() => draft.update({ text: "New owner" }));
    await act(async () => {
      resolveSignOut({ ok: true });
      await pending;
    });
    expect(screen.getByLabelText("Draft")).toHaveProperty("value", "New owner");
    expect(browserCleanup).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
  it("keeps failed server logout drafts and survives StrictMode", async () => {
    render(
      <StrictMode>
        <View />
      </StrictMode>,
    );
    act(() => draft.update({ text: "Still here" }));
    await act(async () => {
      await signOutClientSession({
        signOutOnServer: async () => ({ ok: false }),
        notify: vi.fn(),
      });
    });
    expect(screen.getByLabelText("Draft")).toHaveProperty(
      "value",
      "Still here",
    );
  });
});
