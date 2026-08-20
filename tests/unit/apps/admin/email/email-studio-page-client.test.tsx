/** @vitest-environment jsdom */

import React from "react";
import { getQueryClient, QueryProvider } from "@asym/database/providers";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import EmailStudio from "../../../../../apps/admin/app/(app)/email/page-client";

const editorHandle = vi.hoisted(() => {
  const handle = {
    appliedDesign: {} as Record<string, unknown>,
    canRedo: vi.fn(() => false),
    canUndo: vi.fn(() => false),
    exportDesign: vi.fn(async () => ({})),
    exportEmail: vi.fn(async () => ({
      builder: "react_email" as const,
      builderVersion: "1.5.3",
      design: handle.appliedDesign,
      html: "<p>Current editor</p>",
      text: "Current editor",
    })),
    focus: vi.fn(),
    getBuilderKind: vi.fn(() => "react_email" as const),
    insertMergeTag: vi.fn(),
    loadDesign: vi.fn((design: Record<string, unknown>) => {
      if (!editorReadyControl.nestedReady) {
        return;
      }
      handle.appliedDesign = design;
    }),
    redo: vi.fn(),
    saveDesign: vi.fn(async () => ({})),
    undo: vi.fn(),
  };
  return handle;
});

const editorMount = vi.hoisted(() => ({ count: 0 }));
const editorReadyControl = vi.hoisted(() => ({
  defer: false,
  nestedReady: false,
  fireReady: null as null | (() => void),
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

vi.mock("@/lib/utils", () => ({
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

vi.mock("@asym/ui/components/shadcn/alert", () => ({
  Alert: ({
    children,
    role,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { role?: string }) => (
    <div role={role ?? "alert"} {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
}));

vi.mock("@asym/ui/components/shadcn/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("@asym/ui/components/shadcn/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => null,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  DropdownMenuTrigger: ({
    children,
    render,
  }: {
    children?: React.ReactNode;
    render?: React.ReactNode;
  }) => <>{render ?? children}</>,
}));

vi.mock("@asym/ui/components/shadcn/empty", () => ({
  Empty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  EmptyDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  EmptyHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyMedia: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EmptyTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
}));

vi.mock("@asym/ui/components/shadcn/field", () => ({
  Field: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FieldDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  FieldGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FieldLabel: ({
    children,
    htmlFor,
    className,
  }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

vi.mock("@asym/ui/components/shadcn/item", () => ({
  Item: ({
    children,
    render,
  }: {
    children?: React.ReactNode;
    render?: React.ReactElement;
  }) =>
    React.isValidElement(render) ? (
      React.cloneElement(render, undefined, children)
    ) : (
      <div>{children}</div>
    ),
  ItemContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ItemDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  ItemGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ItemMedia: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ItemTitle: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

vi.mock("@asym/ui/components/shadcn/spinner", () => ({
  Spinner: () => <span role="status">Loading</span>,
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
  ToggleGroup: ({
    children,
    disabled,
    onValueChange,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onValueChange?: (value: string[]) => void;
    "aria-label"?: string;
  }) => (
    <div aria-label={ariaLabel} data-disabled={disabled}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        return child;
      })}
      <button
        type="button"
        hidden
        data-testid="toggle-group-change"
        onClick={() => onValueChange?.(["desktop"])}
      />
    </div>
  ),
  ToggleGroupItem: ({
    children,
    value,
    disabled,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    value: string;
    disabled?: boolean;
    "aria-label"?: string;
  }) => (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      value={value}
    >
      {children}
    </button>
  ),
}));

vi.mock("@asym/ui/components/shadcn/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: ({
    children,
    render,
  }: {
    children?: React.ReactNode;
    render?: React.ReactNode;
  }) => <>{render ?? children}</>,
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
      onDesignUpdate,
    }: {
      onReady?: () => void;
      onDesignUpdate?: (design: Record<string, unknown>) => void;
    },
    ref: React.Ref<typeof editorHandle>,
  ) {
    ReactModule.useImperativeHandle(ref, () => editorHandle, []);
    ReactModule.useEffect(() => {
      editorMount.count += 1;
      if (editorReadyControl.defer) {
        editorReadyControl.nestedReady = false;
        editorReadyControl.fireReady = () => {
          editorReadyControl.nestedReady = true;
          onReady?.();
        };
        return () => {
          editorReadyControl.fireReady = null;
        };
      }
      editorReadyControl.nestedReady = true;
      onReady?.();
    }, [onReady]);

    return (
      <div data-testid="react-email-editor">
        React Email editor
        <button
          type="button"
          onClick={() => onDesignUpdate?.({ blocks: [{ id: "hero" }] })}
        >
          Simulate design update
        </button>
      </div>
    );
  });

  return { EmailStudioEditor };
});

const legacyTemplatesResponse = {
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
};

const reactWelcomeTemplate = {
  builder: "react_email",
  builder_version: "1.5.3",
  default_preheader: "Welcome preheader",
  default_subject: "Welcome subject",
  design_json: { body: { rows: [] } },
  html_content: "<p>welcome</p>",
  id: "react-welcome",
  name: "React welcome",
  text_content: "welcome",
  updated_at: "2026-02-01T00:00:00.000Z",
  version: 1,
};

function mixedTemplatesResponse() {
  return {
    success: true,
    templates: [...legacyTemplatesResponse.templates, reactWelcomeTemplate],
  };
}

function jsonOk(body: unknown) {
  return {
    ok: true,
    json: async () => body,
  };
}

function stubStudioFetch(
  overrides?: (
    url: string,
    method: string,
    init?: RequestInit,
  ) => unknown | null,
) {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      const override = overrides?.(url, method, init);
      if (override != null) {
        if (typeof (override as { then?: unknown }).then === "function") {
          return override as Promise<unknown>;
        }
        return jsonOk(override);
      }
      if (method === "GET" && url === "/api/email/templates") {
        return jsonOk(legacyTemplatesResponse);
      }
      if (
        (method === "POST" && url === "/api/email/templates") ||
        (method === "PATCH" && /^\/api\/email\/templates\/[^/]+$/.test(url))
      ) {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          name?: string;
        };
        const id = method === "PATCH" ? url.split("/").at(-1) : "tmpl_new";
        return jsonOk({
          success: true,
          template: { id, name: body.name ?? "Untitled Email" },
        });
      }
      if (method === "POST" && url === "/api/email/templates/test-send") {
        return jsonOk({ success: true, messageId: "msg_1" });
      }
      throw new Error(`Unexpected fetch ${method} ${url}`);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("EmailStudio page", () => {
  beforeEach(() => {
    getQueryClient().clear();
    editorHandle.appliedDesign = {};
    editorHandle.exportEmail.mockClear();
    editorHandle.loadDesign.mockClear();
    editorHandle.undo.mockClear();
    editorHandle.redo.mockClear();
    editorMount.count = 0;
    editorReadyControl.defer = false;
    editorReadyControl.nestedReady = false;
    editorReadyControl.fireReady = null;
    vi.mocked(toast.success).mockClear();
    stubStudioFetch();
  });

  afterEach(() => {
    cleanup();
    getQueryClient().clear();
    vi.unstubAllGlobals();
  });

  it("keeps legacy templates in read-only mode after preview closes", async () => {
    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

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
    const exportButton = screen.getByRole("button", {
      name: /^export as html/i,
    });
    expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    expect((exportButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.keyDown(window, { key: "s", metaKey: true });
    await waitFor(() => {
      expect(screen.queryByText("Save Email Template")).toBeNull();
    });
    expect(editorHandle.exportEmail).not.toHaveBeenCalled();
    expect(screen.queryByTestId("react-email-editor")).toBeNull();
  });

  it("loads a react_email design into the existing editor without remounting", async () => {
    const reactDesign = { body: { rows: [{ cells: [1], columns: [{}] }] } };
    stubStudioFetch((url, method) => {
      if (method === "GET" && url === "/api/email/templates") {
        return {
          success: true,
          templates: [
            ...legacyTemplatesResponse.templates,
            {
              builder: "react_email",
              builder_version: "1.5.3",
              default_preheader: "Welcome preheader",
              default_subject: "Welcome subject",
              design_json: reactDesign,
              html_content: "<p>welcome</p>",
              id: "react-welcome",
              name: "React welcome",
              text_content: "welcome",
              updated_at: "2026-02-01T00:00:00.000Z",
              version: 1,
            },
          ],
        };
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    const mountsBeforeLoad = editorMount.count;

    fireEvent.click(screen.getByRole("button", { name: /load template/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /react welcome/i }),
    );

    await waitFor(() => {
      expect(editorHandle.loadDesign).toHaveBeenCalledWith(reactDesign);
    });
    expect(editorMount.count).toBe(mountsBeforeLoad);
    expect(screen.getByTestId("react-email-editor")).toBeTruthy();
  });

  it("sends one persist request when Save Template is clicked twice", async () => {
    let resolvePersist: ((value: unknown) => void) | undefined;
    const persistPromise = new Promise((resolve) => {
      resolvePersist = resolve;
    });
    const fetchMock = stubStudioFetch((url, method) => {
      if (method === "POST" && url === "/api/email/templates") {
        return persistPromise;
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await screen.findByText("Save Email Template");
    fireEvent.change(screen.getByPlaceholderText("e.g., Monthly Newsletter"), {
      target: { value: "April campaign" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save template/i }));
    fireEvent.click(screen.getByRole("button", { name: /save template/i }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.filter(
          ([requestUrl, init]) =>
            String(requestUrl) === "/api/email/templates" &&
            String((init as RequestInit | undefined)?.method) === "POST",
        ),
      ).toHaveLength(1);
    });

    resolvePersist?.(
      jsonOk({
        success: true,
        template: { id: "tmpl_new", name: "April campaign" },
      }),
    );

    await waitFor(() => {
      expect(screen.queryByText("Save Email Template")).toBeNull();
    });
  });

  it("does not open save from the keyboard shortcut while a test send is in flight", async () => {
    let resolveTestSend: ((value: unknown) => void) | undefined;
    const testSendPromise = new Promise((resolve) => {
      resolveTestSend = resolve;
    });
    stubStudioFetch((url, method) => {
      if (method === "POST" && url === "/api/email/templates/test-send") {
        return testSendPromise;
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    fireEvent.click(screen.getByRole("button", { name: /send test email/i }));
    const recipient = screen.getByLabelText(/recipient/i);
    fireEvent.change(recipient, { target: { value: "qa@example.com" } });
    fireEvent.submit(recipient.closest("form")!);

    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });

    fireEvent.keyDown(recipient, { key: "s", metaKey: true });
    expect(screen.queryByText("Save Email Template")).toBeNull();

    resolveTestSend?.(
      jsonOk({
        success: true,
        messageId: "msg_1",
      }),
    );
    await waitFor(() => {
      expect(screen.queryByLabelText(/recipient/i)).toBeNull();
    });
  });

  it("does not start a test send while a save is in flight", async () => {
    let resolvePersist: ((value: unknown) => void) | undefined;
    const persistPromise = new Promise((resolve) => {
      resolvePersist = resolve;
    });
    const fetchMock = stubStudioFetch((url, method) => {
      if (method === "POST" && url === "/api/email/templates") {
        return persistPromise;
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    fireEvent.change(screen.getByPlaceholderText("e.g., Monthly Newsletter"), {
      target: { value: "April campaign" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save template/i }));

    await waitFor(() => {
      expect(
        (
          screen.getByRole("button", {
            name: /send test email/i,
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: /send test email/i }));
    expect(screen.queryByLabelText(/recipient/i)).toBeNull();
    expect(
      fetchMock.mock.calls.filter(
        ([requestUrl, init]) =>
          String(requestUrl) === "/api/email/templates/test-send" &&
          String((init as RequestInit | undefined)?.method) === "POST",
      ),
    ).toHaveLength(0);

    resolvePersist?.(
      jsonOk({
        success: true,
        template: { id: "tmpl_new", name: "April campaign" },
      }),
    );
    await waitFor(() => {
      expect(screen.queryByText("Save Email Template")).toBeNull();
    });
  });

  it("does not intercept native undo when the template name input is focused", async () => {
    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    const nameInput = screen.getByPlaceholderText("Untitled Email");
    nameInput.focus();
    fireEvent.keyDown(nameInput, { key: "z", metaKey: true });

    expect(editorHandle.undo).not.toHaveBeenCalled();
  });

  it("exposes accessible names on icon-only toolbar controls", async () => {
    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");

    expect(screen.getByRole("button", { name: /^undo$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^redo$/i })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /desktop preview/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /mobile preview/i }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /^more$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^fullscreen$/i })).toBeTruthy();
  });

  it("marks the current draft unsaved when the editor reports a design update", async () => {
    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    expect(screen.queryByText("Unsaved")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: /simulate design update/i }),
    );

    expect(screen.getByText("Unsaved")).toBeTruthy();
  });

  it("marks the draft unsaved when the header template name changes", async () => {
    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    expect(screen.queryByText("Unsaved")).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Untitled Email"), {
      target: { value: "April campaign" },
    });

    expect(screen.getByText("Unsaved")).toBeTruthy();
  });

  it("clears the unsaved badge when a dirty draft loads a legacy template", async () => {
    stubStudioFetch((url, method) => {
      if (method === "GET" && url === "/api/email/templates") {
        return mixedTemplatesResponse();
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    fireEvent.change(screen.getByPlaceholderText("Untitled Email"), {
      target: { value: "April campaign" },
    });
    expect(screen.getByText("Unsaved")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /load template/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /legacy welcome/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /close preview/i }));

    expect(screen.queryByText("Unsaved")).toBeNull();
    expect(
      (screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("keeps Save disabled after switching from legacy to React Email until the editor is ready", async () => {
    stubStudioFetch((url, method) => {
      if (method === "GET" && url === "/api/email/templates") {
        return mixedTemplatesResponse();
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    fireEvent.click(screen.getByRole("button", { name: /load template/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /legacy welcome/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /close preview/i }));

    editorReadyControl.defer = true;
    fireEvent.click(screen.getByRole("button", { name: /load template/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /react welcome/i }),
    );

    await screen.findByTestId("react-email-editor");
    expect(
      (screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    fireEvent.keyDown(window, { key: "s", metaKey: true });
    expect(screen.queryByText("Save Email Template")).toBeNull();

    editorReadyControl.fireReady?.();
    await waitFor(() => {
      expect(
        (screen.getByRole("button", { name: /^save$/i }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);
    });
  });

  it("replays a selected React Email design after the nested editor becomes ready", async () => {
    editorReadyControl.defer = true;
    const fetchMock = stubStudioFetch((url, method) => {
      if (method === "GET" && url === "/api/email/templates") {
        return mixedTemplatesResponse();
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    fireEvent.click(screen.getByRole("button", { name: /load template/i }));
    fireEvent.click(
      await screen.findByRole("button", { name: /react welcome/i }),
    );

    expect(editorHandle.appliedDesign).toEqual({});

    editorReadyControl.fireReady?.();

    await waitFor(() => {
      expect(editorHandle.appliedDesign).toEqual(
        reactWelcomeTemplate.design_json,
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    fireEvent.click(screen.getByRole("button", { name: /save template/i }));

    await waitFor(() => {
      const persistCall = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url) === "/api/email/templates/react-welcome" &&
          String((init as RequestInit | undefined)?.method) === "PATCH",
      );
      expect(persistCall).toBeTruthy();
      const body = JSON.parse(
        String((persistCall?.[1] as RequestInit | undefined)?.body),
      ) as { designJson?: unknown };
      expect(body.designJson).toEqual(reactWelcomeTemplate.design_json);
    });
  });

  it("persists the save-dialog draft name without remounting the editor", async () => {
    const fetchMock = stubStudioFetch();

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    const mountsBeforeSave = editorMount.count;

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    fireEvent.change(screen.getByPlaceholderText("e.g., Monthly Newsletter"), {
      target: { value: "April campaign" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save template/i }));

    await waitFor(() => {
      const persistCall = fetchMock.mock.calls.find(
        ([url, init]) =>
          String(url) === "/api/email/templates" &&
          String((init as RequestInit | undefined)?.method) === "POST",
      );
      expect(persistCall).toBeTruthy();
      const body = JSON.parse(
        String((persistCall?.[1] as RequestInit | undefined)?.body),
      ) as { name?: string };
      expect(body.name).toBe("April campaign");
    });

    expect(editorMount.count).toBe(mountsBeforeSave);
    await waitFor(() => {
      expect(screen.queryByText("Unsaved")).toBeNull();
    });
  });

  it("submits the test-send form and falls back when messageId is absent", async () => {
    stubStudioFetch((_url, method) => {
      if (method === "POST" && _url === "/api/email/templates/test-send") {
        return { success: true };
      }
      return null;
    });

    render(
      <QueryProvider>
        <EmailStudio />
      </QueryProvider>,
    );

    await screen.findByTestId("react-email-editor");
    fireEvent.click(screen.getByRole("button", { name: /send test email/i }));

    const recipient = screen.getByLabelText(/recipient/i);
    fireEvent.change(recipient, { target: { value: "qa@example.com" } });
    fireEvent.submit(recipient.closest("form")!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Test email sent",
        expect.objectContaining({
          description: "Test email queued for qa@example.com.",
        }),
      );
    });

    await waitFor(() => {
      expect(screen.queryByLabelText(/recipient/i)).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: /send test email/i }));
    expect(
      (screen.getByLabelText(/recipient/i) as HTMLInputElement).value,
    ).toBe("");
  });
});
