/** @vitest-environment jsdom */

import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EmailStudio from "../../../../../apps/admin/app/email/page-client";

const editorHandle = vi.hoisted(() => ({
  canRedo: vi.fn(() => false),
  canUndo: vi.fn(() => false),
  exportDesign: vi.fn(async () => ({})),
  exportEmail: vi.fn(async () => ({
    builder: "react_email",
    builderVersion: "1.5.3",
    design: {},
    html: "<p>Current editor</p>",
    text: "Current editor",
  })),
  focus: vi.fn(),
  getBuilderKind: vi.fn(() => "react_email"),
  insertMergeTag: vi.fn(),
  loadDesign: vi.fn(),
  redo: vi.fn(),
  saveDesign: vi.fn(async () => ({})),
  undo: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@asym/ui/lib/utils", () => ({
  cn: (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("@asym/ui/components/shadcn/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@asym/ui/components/shadcn/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <footer>{children}</footer>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <header>{children}</header>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("@asym/ui/components/shadcn/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => null,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@asym/ui/components/shadcn/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@asym/ui/components/shadcn/kbd", () => ({
  Kbd: ({ children }: { children: React.ReactNode }) => <kbd>{children}</kbd>,
}));

vi.mock("@asym/ui/components/shadcn/label", () => ({
  Label: ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@asym/ui/components/shadcn/separator", () => ({
  Separator: () => <hr />,
}));

vi.mock("@asym/ui/components/shadcn/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

vi.mock("@asym/ui/components/shadcn/toggle-group", () => ({
  ToggleGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ToggleGroupItem: ({
    children,
    onClick,
    value,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    value: string;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
      {value}
    </button>
  ),
}));

vi.mock("@asym/ui/components/shadcn/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@asym/ui/components/studio/EmailStudioMergeTagMenu", () => ({
  EmailStudioMergeTagMenu: ({ disabled }: { disabled?: boolean }) => (
    <button disabled={disabled} type="button">
      Merge tags
    </button>
  ),
}));

vi.mock("@asym/ui/components/studio/EmailStudioProviderStatus", () => ({
  EmailStudioProviderStatus: () => <span>React Email</span>,
}));

vi.mock("@asym/ui/components/studio/EmailStudioPreview", () => ({
  EmailStudioPreviewDialog: ({
    html,
    onOpenChange,
    open,
    preheader,
    subject,
  }: {
    html: string;
    onOpenChange: (open: boolean) => void;
    open: boolean;
    preheader?: string;
    subject?: string;
  }) =>
    open ? (
      <section aria-label="Email preview" role="dialog">
        <p>
          {subject} · {preheader}
        </p>
        <div>{html}</div>
        <button type="button" onClick={() => onOpenChange(false)}>
          Close preview
        </button>
      </section>
    ) : null,
}));

vi.mock("@asym/ui/components/studio/EmailStudioEditor", async () => {
  const ReactModule = await import("react");

  const EmailStudioEditor = ReactModule.forwardRef(function EmailStudioEditor(
    {
      onReady,
    }: {
      onReady?: () => void;
    },
    ref: React.Ref<typeof editorHandle>,
  ) {
    ReactModule.useImperativeHandle(ref, () => editorHandle, []);
    ReactModule.useEffect(() => {
      onReady?.();
    }, [onReady]);

    return <div data-testid="react-email-editor">React Email editor</div>;
  });

  return { EmailStudioEditor };
});

describe("EmailStudio page", () => {
  beforeEach(() => {
    editorHandle.exportEmail.mockClear();
    editorHandle.loadDesign.mockClear();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          success: true,
          templates: [
            {
              builder: "unlayer",
              builder_version: "legacy",
              default_preheader: "Legacy preheader",
              default_subject: "Legacy subject",
              design_json: { legacy: true },
              html_content: "<p>Legacy body</p>",
              id: "legacy-template",
              name: "Legacy welcome",
              text_content: "Legacy body",
              updated_at: "2026-01-01T00:00:00.000Z",
              version: 3,
            },
          ],
        }),
      })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps legacy templates in read-only mode after preview closes", async () => {
    render(<EmailStudio />);

    await screen.findByTestId("react-email-editor");

    fireEvent.click(screen.getByRole("button", { name: /load template/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /legacy welcome/i }),
    );

    expect(screen.getByText("Legacy subject · Legacy preheader")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /close preview/i }));

    expect(
      screen.getByRole("status", {
        name: /legacy template selected read-only/i,
      }),
    ).toBeTruthy();

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    const exportButton = screen.getByRole("button", { name: /^export as html/i });
    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    expect((exportButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.keyDown(window, { key: "s", metaKey: true });
    await waitFor(() => {
      expect(screen.queryByText("Save Email Template")).toBeNull();
    });
    expect(editorHandle.exportEmail).not.toHaveBeenCalled();
  });
});
