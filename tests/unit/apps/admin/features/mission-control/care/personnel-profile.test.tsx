/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  PersonnelProfile,
  PersonnelProfileActions,
} from "../../../../../../../apps/admin/features/mission-control/care/components/PersonnelProfile";
import type {
  CarePersonnel,
  ActivityLogEntry,
} from "../../../../../../../apps/admin/features/mission-control/care/types";

const { log, goal, rhythm, post, pending } = vi.hoisted(() => ({
  log: vi.fn(),
  goal: vi.fn(),
  rhythm: vi.fn(),
  post: vi.fn(),
  pending: { value: false },
}));
vi.mock("@asym/database/hooks", () => ({
  useCreateCareThreadPost: () => ({
    mutateAsync: post,
    isPending: pending.value,
  }),
  useCreateCarePrivateNote: () => ({
    mutateAsync: post,
    isPending: pending.value,
  }),
  useCreateOrUpdateCareGoal: () => ({ mutateAsync: goal }),
  useLogCareActivity: () => ({ mutateAsync: log, isPending: pending.value }),
  useUpsertCareRequirement: () => ({ mutateAsync: rhythm }),
  useSetManualAttentionFlag: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("@asym/ui/components/shadcn/rich-text-editor", async (original) => ({
  ...(await original<object>()),
  LegacyRichTextEditor: ({
    value,
    onChange,
    imagePurpose: _imagePurpose,
    ...props
  }: {
    value: string;
    onChange: (value: string) => void;
    imagePurpose?: string;
  }) => (
    <textarea
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
  RichTextViewer: ({ value, size }: { value: string; size?: string }) => (
    <div data-testid="rich-viewer" data-size={size ?? "responsive"}>
      {value}
    </div>
  ),
}));
const person: CarePersonnel = {
  id: "member",
  name: "Name not set",
  nameMissing: true,
  initials: "",
  role: "Nurse",
  location: "Kenya",
  timezone: "UTC",
  region: "Africa",
  status: "Healthy",
  lastCheckIn: null,
  healthSignals: {
    emotional: null,
    spiritual: null,
    physical: null,
    financial: null,
  },
  careGaps: ["Duplicate title"],
};
const entry = (
  id: string,
  kind: "thread" | "activity",
  content: string,
  date = "2026-10-01",
): ActivityLogEntry => ({
  id,
  kind,
  content,
  date,
  personnelId: person.id,
  type: "Pastoral Note",
  authorId: "staff",
  authorName: "Staff",
  isPrivate: false,
});
beforeEach(() => {
  vi.clearAllMocks();
  pending.value = false;
  log.mockResolvedValue({});
  goal.mockResolvedValue({});
  rhythm.mockResolvedValue({});
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each([
  ["Care thread", "Care thread update"],
  ["Private notes", "Private care note"],
])(
  "protects the %s draft while saving and keeps it after failure",
  async (section, label) => {
    post.mockRejectedValueOnce(new Error("Offline"));
    const { rerender } = render(
      <PersonnelProfile personnel={person} activities={[]} privateNotes={[]} />,
    );
    fireEvent.click(screen.getByRole("tab", { name: section }));
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: "Please follow up next week." },
    });
    pending.value = true;
    rerender(
      <PersonnelProfile personnel={person} activities={[]} privateNotes={[]} />,
    );
    expect((screen.getByLabelText(label) as HTMLTextAreaElement).readOnly).toBe(
      true,
    );
    pending.value = false;
    rerender(
      <PersonnelProfile personnel={person} activities={[]} privateNotes={[]} />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: section === "Care thread" ? "Post update" : "Save note",
      }),
    );
    await waitFor(() => expect(post).toHaveBeenCalled());
    expect((screen.getByLabelText(label) as HTMLTextAreaElement).value).toBe(
      "Please follow up next week.",
    );
  },
);

it("locks the contact fields while a contact is being saved", () => {
  const { rerender } = render(<PersonnelProfileActions personnel={person} />);
  fireEvent.click(screen.getByRole("button", { name: "Log contact" }));
  pending.value = true;
  rerender(<PersonnelProfileActions personnel={person} />);
  expect(
    (screen.getByLabelText("Contact note") as HTMLTextAreaElement).disabled,
  ).toBe(true);
  expect(
    (
      screen.getByRole("combobox", {
        name: "Contact type",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});

it.each([
  ["Care thread", "Care thread update", "Post update"],
  ["Private notes", "Private care note", "Save note"],
])(
  "keeps the %s draft across sections and clears it only after saving",
  async (section, label, action) => {
    render(
      <PersonnelProfile personnel={person} activities={[]} privateNotes={[]} />,
    );
    fireEvent.click(screen.getByRole("tab", { name: section }));
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: "Keep this draft." },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));
    fireEvent.click(screen.getByRole("tab", { name: section }));
    expect((screen.getByLabelText(label) as HTMLTextAreaElement).value).toBe(
      "Keep this draft.",
    );
    fireEvent.click(screen.getByRole("button", { name: action }));
    await waitFor(() =>
      expect((screen.getByLabelText(label) as HTMLTextAreaElement).value).toBe(
        "",
      ),
    );
    expect(post).toHaveBeenCalledWith({
      personnelId: person.id,
      content: "Keep this draft.",
    });
  },
);

it("opens a contact form instead of fabricating a check-in; retains notes after failure", async () => {
  log.mockRejectedValueOnce(new Error("Offline"));
  render(<PersonnelProfileActions personnel={person} />);
  fireEvent.click(screen.getByRole("button", { name: "Log contact" }));
  expect(log).not.toHaveBeenCalled();
  const dialog = screen.getByRole("dialog");
  fireEvent.change(within(dialog).getByLabelText("Contact note"), {
    target: { value: "  We spoke about rest.  " },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "Log contact" }));
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain("could not"),
  );
  expect(
    (screen.getByLabelText("Contact note") as HTMLTextAreaElement).value,
  ).toContain("We spoke about rest.");
  expect(log).toHaveBeenCalledWith({
    personnelId: "member",
    type: "Check-in",
    content: "We spoke about rest.",
  });
});

it("shows unassessed signals without meters and keeps plain contact text literal", () => {
  const json = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Readable words" }],
      },
    ],
  });
  render(
    <PersonnelProfile
      personnel={person}
      activities={[
        entry("one", "activity", "<not markup>\nSecond line"),
        entry("two", "activity", json),
      ]}
      privateNotes={[]}
    />,
  );
  expect(
    screen.getByText("No wellbeing assessment has been recorded."),
  ).toBeTruthy();
  expect(screen.queryByRole("meter")).toBeNull();
  expect(screen.getByText("Readable words")).toBeTruthy();
  expect(screen.getByText(/<not markup>/)).toBeTruthy();
});

it("reads legacy HTML activity as plain text without rendering stored markup", () => {
  const { container } = render(
    <PersonnelProfile
      personnel={person}
      activities={[
        entry(
          "legacy",
          "activity",
          '<p>Rest &amp; family.</p><p>Call <strong>next week</strong>.<br>Bring notes.</p><script>alert("unsafe")</script><img src="x" onerror="alert(1)">',
        ),
      ]}
      privateNotes={[]}
    />,
  );
  const text = screen.getByText(/Rest & family/);
  expect(text.textContent).toBe(
    "Rest & family.\nCall next week.\nBring notes.",
  );
  expect(container.querySelector("script, img")).toBeNull();
  fireEvent.click(screen.getByRole("tab", { name: "Activity" }));
  expect(
    within(screen.getByRole("region", { name: "Activity" })).getByText(
      /Rest & family/,
    ),
  ).toBeTruthy();
});

it("shows only thread posts oldest first and rejects empty editor documents", () => {
  render(
    <PersonnelProfile
      personnel={person}
      activities={[
        entry("new", "thread", "New post", "2026-10-02"),
        entry("contact", "activity", "Contact only"),
        entry("old", "thread", "Old post"),
      ]}
      privateNotes={[]}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Care thread" }));
  const panel = screen.getByRole("region", { name: "Care thread" });
  expect(within(panel).queryByText("Contact only")).toBeNull();
  expect(panel.textContent!.indexOf("Old post")).toBeLessThan(
    panel.textContent!.indexOf("New post"),
  );
  fireEvent.change(screen.getByLabelText("Care thread update"), {
    target: { value: '{"type":"doc","content":[{"type":"paragraph"}]}' },
  });
  expect(
    (screen.getByRole("button", { name: "Post update" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});

it("keeps thread posts and private notes in compact type at every width", () => {
  const json = JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Rich words" }] },
    ],
  });
  render(
    <PersonnelProfile
      personnel={person}
      activities={[entry("post", "thread", json)]}
      privateNotes={[{ ...entry("note", "activity", json), isPrivate: true }]}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Care thread" }));
  fireEvent.click(screen.getByRole("tab", { name: "Private notes" }));
  const viewers = screen.getAllByTestId("rich-viewer");
  expect(viewers.length).toBeGreaterThanOrEqual(2);
  for (const viewer of viewers) {
    expect(viewer.getAttribute("data-size")).toBe("sm");
  }
});

it("selects and clears a goal target date with the shared calendar", async () => {
  render(
    <PersonnelProfile personnel={person} activities={[]} privateNotes={[]} />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Care plan" }));
  fireEvent.change(screen.getByLabelText("Add a goal"), {
    target: { value: "Plan rest" },
  });
  fireEvent.click(screen.getByLabelText("Target date (optional)"));
  const dialog = await screen.findByRole("dialog", { name: "Target date" });
  const day = within(dialog)
    .getAllByRole("button")
    .find(
      (button) =>
        button.textContent === "15" && !button.hasAttribute("data-outside"),
    );
  expect(day).toBeTruthy();
  fireEvent.click(day!);
  expect(
    screen.getByLabelText("Target date (optional)").textContent,
  ).not.toContain("Select date");
  fireEvent.click(screen.getByLabelText("Target date (optional)"));
  fireEvent.click(
    within(
      await screen.findByRole("dialog", { name: "Target date" }),
    ).getByRole("button", { name: "Clear date" }),
  );
  expect(screen.getByLabelText("Target date (optional)").textContent).toContain(
    "Select date",
  );
  fireEvent.click(screen.getByLabelText("Target date (optional)"));
  const reopened = await screen.findByRole("dialog", { name: "Target date" });
  fireEvent.click(
    within(reopened)
      .getAllByRole("button")
      .find(
        (button) =>
          button.textContent === "15" && !button.hasAttribute("data-outside"),
      )!,
  );
  fireEvent.click(screen.getByRole("button", { name: "Add goal" }));
  const now = new Date();
  await waitFor(() =>
    expect(goal).toHaveBeenCalledWith({
      personnelId: person.id,
      title: "Plan rest",
      status: "active",
      targetDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-15`,
    }),
  );
  expect(screen.getByLabelText("Target date (optional)").textContent).toContain(
    "Select date",
  );
});

it("uses real goal IDs and updates the selected saved cadence", async () => {
  render(
    <PersonnelProfile
      personnel={person}
      activities={[]}
      privateNotes={[]}
      goals={[
        {
          id: "goal-1",
          personnelId: "member",
          title: "Rest",
          status: "active",
          targetDate: "2026-12-01",
        },
        {
          id: "goal-2",
          personnelId: "member",
          title: "Rest",
          status: "completed",
        },
      ]}
      requirements={[
        {
          id: "cadence-1",
          personnelId: "member",
          activityType: "Check-in",
          intervalDays: 14,
          notes: "Fortnightly",
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Care plan" }));
  expect(
    within(screen.getByRole("region", { name: "Care plan" })).queryByText(
      "Duplicate title",
    ),
  ).toBeNull();
  expect(screen.getAllByText("Rest")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Mark done" }));
  await waitFor(() =>
    expect(goal).toHaveBeenCalledWith({
      personnelId: "member",
      id: "goal-1",
      title: "Rest",
      status: "completed",
      targetDate: "2026-12-01",
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Reopen" }));
  await waitFor(() =>
    expect(goal).toHaveBeenCalledWith(
      expect.objectContaining({ id: "goal-2", status: "active" }),
    ),
  );
  expect(
    (screen.getByLabelText("Every (days)") as HTMLInputElement).value,
  ).toBe("14");
  fireEvent.change(screen.getByLabelText("Every (days)"), {
    target: { value: "21" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Update schedule" }));
  await waitFor(() =>
    expect(rhythm).toHaveBeenCalledWith(
      expect.objectContaining({ id: "cadence-1", intervalDays: 21 }),
    ),
  );
  expect(screen.getByLabelText("Target date (optional)")).toBeTruthy();
});

it("reads legacy private-note HTML without changing literal angle brackets", () => {
  render(
    <PersonnelProfile
      personnel={person}
      activities={[]}
      privateNotes={[
        {
          ...entry(
            "html",
            "activity",
            "<p>A &amp; B</p><p>Second paragraph</p><script>bad()</script>",
          ),
          isPrivate: true,
        },
        {
          ...entry("literal", "activity", "Keep <person> and 2 < 3"),
          isPrivate: true,
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Private notes" }));
  expect(screen.getByText(/A & B/).textContent).toBe("A & B\nSecond paragraph");
  expect(screen.getByText("Keep <person> and 2 < 3")).toBeTruthy();
  expect(screen.queryByText(/bad\(\)/)).toBeNull();
});
