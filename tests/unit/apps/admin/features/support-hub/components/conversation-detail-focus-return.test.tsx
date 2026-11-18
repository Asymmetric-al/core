// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the conversation pane's public UI boundary.
import { ConversationDetail } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationDetail";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversation",
  () => ({
    useSupportConversation: (id: string | null) => ({
      data: id ? { id, subject: `Conversation ${id}`, assignee: null } : null,
      isLoading: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationHeader",
  () => ({
    ConversationHeader: ({ onClose }: { onClose: () => void }) => (
      <button type="button" onClick={onClose}>
        Close conversation
      </button>
    ),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationTimeline",
  () => ({ ConversationTimeline: () => <p>Thread messages</p> }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/composer/ConversationComposer",
  () => ({ ConversationComposer: () => null }),
);

afterEach(cleanup);

const IDS = ["one", "two", "three"];

/** The inbox's shape: j moves focus to the next card, then the pane shows it. */
function Inbox({
  layout = "inline",
  returnTo,
}: {
  layout?: "inline" | "sheet";
  /** The card the sheet's finalFocus names. */
  returnTo?: string;
}) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const stepFocus = React.useRef<string | null>(null);
  const cards = React.useRef(new Map<string, HTMLButtonElement>());

  React.useLayoutEffect(() => {
    if (!selected || stepFocus.current !== selected) return;
    stepFocus.current = null;
    cards.current.get(selected)?.focus();
  }, [selected]);

  return (
    <>
      <ul
        onKeyDown={(event) => {
          if (event.key !== "j" || !selected) return;
          const next = IDS[Math.min(IDS.indexOf(selected) + 1, IDS.length - 1)];
          stepFocus.current = next ?? null;
          setSelected(next ?? null);
        }}
      >
        {IDS.map((id) => (
          <li key={id}>
            <button
              type="button"
              ref={(node) => {
                if (node) cards.current.set(id, node);
              }}
              onClick={() => setSelected(id)}
            >
              Card {id}
            </button>
          </li>
        ))}
      </ul>
      {layout === "sheet" ? (
        <ConversationDetail
          conversationId={selected}
          onClose={() => setSelected(null)}
          layout="sheet"
          finalFocus={() =>
            (returnTo ? cards.current.get(returnTo) : null) ?? null
          }
        />
      ) : selected ? (
        <ConversationDetail
          conversationId={selected}
          onClose={() => setSelected(null)}
          layout="inline"
        />
      ) : null}
    </>
  );
}

describe("ConversationDetail focus return", () => {
  it("returns focus to the card of the conversation being closed after j steps", async () => {
    render(<Inbox />);
    const first = screen.getByRole("button", { name: "Card one" });
    first.focus();
    fireEvent.click(first);

    fireEvent.keyDown(first, { key: "j" });
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "j" });
    const third = screen.getByRole("button", { name: "Card three" });
    expect(document.activeElement).toBe(third);

    const close = screen.getByRole("button", { name: "Close conversation" });
    close.focus();
    await act(async () => {
      fireEvent.click(close);
    });

    expect(screen.queryByRole("complementary")).toBeNull();
    expect(document.activeElement).toBe(third);
  });

  it("returns focus to the opening card when the pane closes without a step", async () => {
    render(<Inbox />);
    const second = screen.getByRole("button", { name: "Card two" });
    second.focus();
    fireEvent.click(second);

    const close = screen.getByRole("button", { name: "Close conversation" });
    close.focus();
    await act(async () => {
      fireEvent.click(close);
    });

    expect(document.activeElement).toBe(second);
  });

  it("returns the sheet's focus straight to the card its finalFocus names", async () => {
    render(<Inbox layout="sheet" returnTo="three" />);
    const first = screen.getByRole("button", { name: "Card one" });
    const third = screen.getByRole("button", { name: "Card three" });
    first.focus();
    await act(async () => {
      fireEvent.click(first);
    });
    const sheet = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(sheet.contains(document.activeElement)).toBe(true),
    );
    const firstFocused = vi.fn();
    first.addEventListener("focus", firstFocused);

    await act(async () => {
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await waitFor(() => expect(document.activeElement).toBe(third));
    expect(firstFocused).not.toHaveBeenCalled();
  });
});
