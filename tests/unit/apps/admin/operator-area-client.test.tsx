// @vitest-environment jsdom

import { randomBytes } from "node:crypto";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mfa = vi.hoisted(() => ({
  readFactorState: vi.fn(),
  startEnrolment: vi.fn(),
  verifyCode: vi.fn(),
  removeFactor: vi.fn(),
  // D-18 (AL-2675 WP2c rest, pull request A): the area also reads the
  // history with no organization; answered empty unless a test says more.
  readPlatformHistory: vi.fn(),
}));

const session = vi.hoisted(() => ({
  signOutClientSession: vi.fn(),
  domAtSignOut: "",
}));

vi.mock("@asym/auth/operator-mfa", () => ({
  readFactorState: mfa.readFactorState,
  startEnrolment: mfa.startEnrolment,
  verifyCode: mfa.verifyCode,
  removeFactor: mfa.removeFactor,
  readPlatformHistory: mfa.readPlatformHistory,
}));

vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: session.signOutClientSession,
}));

const { OperatorAreaClient } =
  await import("../../../../apps/admin/app/(operator)/operator/operator-area-client");
const { getQueryClient } =
  await import("../../../../packages/database/providers");

const VERIFIED = "Your session is verified with a second factor.";
const REFUSED =
  "The database did not confirm your operator session. Sign out and sign in again.";

function base32Secret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  return [...randomBytes(32)].map((byte) => alphabet[byte % 32]).join("");
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function factorRow(id: string, name: string) {
  return { id, friendlyName: name, createdAt: "2026-11-20T10:00:00Z" };
}

async function typeCode(field: HTMLElement, code: string) {
  const first = within(field).getAllByRole("textbox")[0]!;
  fireEvent.paste(first, { clipboardData: { getData: () => code } });
}

let secret = "";
let leaks: string[] = [];
let cookieSetter: PropertyDescriptor | undefined;

beforeEach(() => {
  secret = base32Secret();
  leaks = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  for (const method of ["log", "info", "warn", "error", "debug"] as const) {
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      leaks.push(`console.${method}:${args.map(String).join(" ")}`);
    });
  }
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(
    (key: string, value: string) => {
      leaks.push(`storage:${key}=${value}`);
    },
  );
  cookieSetter = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
  Object.defineProperty(Document.prototype, "cookie", {
    configurable: true,
    get: () => "",
    set: (value: string) => {
      leaks.push(`cookie:${value}`);
    },
  });
  mfa.readFactorState.mockReset();
  mfa.startEnrolment.mockReset();
  mfa.verifyCode.mockReset();
  mfa.removeFactor.mockReset();
  mfa.readPlatformHistory.mockReset();
  mfa.readPlatformHistory.mockResolvedValue({ kind: "rows", rows: [] });
  session.signOutClientSession.mockReset();
  session.domAtSignOut = "";
  session.signOutClientSession.mockImplementation(async () => {
    session.domAtSignOut = document.body.innerHTML;
    return { ok: true, redirected: true };
  });
  mfa.startEnrolment.mockResolvedValue({
    ok: true,
    factorId: "new-factor",
    qrCode:
      'data:image/svg+xml;utf-8,<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>\n',
    secret,
  });
});

afterEach(() => {
  cleanup();
  if (cookieSetter) {
    Object.defineProperty(Document.prototype, "cookie", cookieSetter);
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function expectSecretAbsent(html = document.body.innerHTML) {
  const grouped = secret.match(/.{1,4}/g)!.join(" ");
  for (const form of [secret, grouped, secret.toLowerCase()]) {
    expect(html).not.toContain(form);
  }
  expect(html).not.toContain("otpauth://");
}

function expectNothingLeaked() {
  for (const leak of leaks) {
    expect(leak.replace(/\s/g, "").toUpperCase()).not.toContain(secret);
  }
  const caches = JSON.stringify({
    queries: getQueryClient()
      .getQueryCache()
      .getAll()
      .map((query) => [query.queryKey, query.state.data]),
    mutations: getQueryClient()
      .getMutationCache()
      .getAll()
      .map((mutation) => mutation.state),
  });
  expect(caches.toUpperCase()).not.toContain(secret);
}

async function openEnrolment() {
  mfa.readFactorState.mockResolvedValue({ kind: "enrol" });
  render(<OperatorAreaClient />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Set up an authenticator" }),
  );
  await screen.findByRole("img", {
    name: "QR code for your authenticator app",
  });
}

describe("AL-2675 WP2c part 2a, T4: the operator area's screens", () => {
  it("shows a skeleton and nothing about the person while the state loads", () => {
    mfa.readFactorState.mockReturnValue(new Promise(() => undefined));
    const { container } = render(<OperatorAreaClient />);
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(container.textContent).toBe("");
  });

  it("offers enrolment, and never says verified, when there is no verified factor", async () => {
    mfa.readFactorState.mockResolvedValue({ kind: "enrol" });
    render(<OperatorAreaClient />);
    expect(
      await screen.findByRole("button", { name: "Set up an authenticator" }),
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain(VERIFIED);
    expect(mfa.startEnrolment).not.toHaveBeenCalled();
  });

  it("draws the QR from Auth's raw SVG, trimmed of its trailing newline and URL-encoded", async () => {
    const svg =
      '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill:#000000" width="1" height="1"/></svg>';
    mfa.startEnrolment.mockResolvedValue({
      ok: true,
      factorId: "new-factor",
      qrCode: `data:image/svg+xml;utf-8,${svg}\n`,
      secret,
    });
    await openEnrolment();
    const qr = screen.getByRole("img", {
      name: "QR code for your authenticator app",
    });
    expect(qr.getAttribute("src")).toBe(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    );
  });

  it("shows the QR, the key in groups of four and a six-slot code field, each blocked from replay", async () => {
    await openEnrolment();
    const qr = screen.getByRole("img", {
      name: "QR code for your authenticator app",
    });
    expect(qr.closest("[data-sentry-block]")).not.toBeNull();
    const key = screen
      .getByRole("group", { name: "Key" })
      .querySelector("code")!;
    expect(key.textContent).toBe(secret.match(/.{1,4}/g)!.join(" "));
    expect(key.hasAttribute("aria-labelledby")).toBe(false);
    expect(key.closest("[data-sentry-block]")).not.toBeNull();
    const field = document.querySelector('[data-slot="input-otp"]')!;
    expect(field.hasAttribute("data-sentry-block")).toBe(true);
    expect(within(field as HTMLElement).getAllByRole("textbox")).toHaveLength(
      6,
    );
    expect(
      within(field as HTMLElement)
        .getAllByRole("textbox")[0]!
        .getAttribute("autocomplete"),
    ).toBe("one-time-code");
    expect(
      screen.getByText("Enter the 6-digit code from the app"),
    ).toBeTruthy();
    expect(
      screen.getByText("Verifying signs you out on your other devices."),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Operator actions need a second factor. Scan this code with an authenticator app, or enter the key by hand.",
      ),
    ).toBeTruthy();
    expectNothingLeaked();
  });

  it("clears the QR and the key after a successful verification and reads the state again", async () => {
    await openEnrolment();
    mfa.verifyCode.mockResolvedValue({ ok: true });
    mfa.readFactorState.mockResolvedValue({
      kind: "area",
      factors: [factorRow("new-factor", "Authenticator 1")],
    });
    await typeCode(
      document.querySelector('[data-slot="input-otp"]') as HTMLElement,
      "123456",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Verify and continue" }),
    );
    expect(await screen.findByText(VERIFIED)).toBeTruthy();
    expect(mfa.verifyCode).toHaveBeenCalledWith("new-factor", "123456");
    expect(mfa.readFactorState).toHaveBeenCalledTimes(2);
    expectSecretAbsent();
    expectNothingLeaked();
  });

  it("removes the unverified factor and clears the key on Cancel", async () => {
    await openEnrolment();
    mfa.removeFactor.mockResolvedValue({ ok: true });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(mfa.removeFactor).toHaveBeenCalledWith("new-factor"),
    );
    await screen.findByRole("button", { name: "Set up an authenticator" });
    expectSecretAbsent();
    expectNothingLeaked();
  });

  it("clears the enrolment before signing out", async () => {
    await openEnrolment();
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() =>
      expect(session.signOutClientSession).toHaveBeenCalledTimes(1),
    );
    expectSecretAbsent(session.domAtSignOut);
    expectNothingLeaked();
  });

  it("keeps the key out of the document once the component unmounts", async () => {
    await openEnrolment();
    cleanup();
    expectSecretAbsent();
    expectNothingLeaked();
  });

  it("shows the fixed text an enrolment failure returns", async () => {
    mfa.readFactorState.mockResolvedValue({ kind: "enrol" });
    mfa.startEnrolment.mockResolvedValue({
      ok: false,
      message:
        "Two-step sign-in is switched off for this project. Ask the release owner to switch on TOTP.",
      reread: false,
      mismatch: false,
    });
    render(<OperatorAreaClient />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Set up an authenticator" }),
    );
    expect(
      await screen.findByText(
        "Two-step sign-in is switched off for this project. Ask the release owner to switch on TOTP.",
      ),
    ).toBeTruthy();
  });

  it("asks for the code when a verified factor exists below aal2, and sends one request for two clicks and two Enters", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1"],
    });
    render(<OperatorAreaClient />);
    expect(await screen.findByText("Enter your code")).toBeTruthy();
    expect(
      screen.getByText(
        "Open your authenticator app and enter the current 6-digit code.",
      ),
    ).toBeTruthy();
    const field = document.querySelector(
      '[data-slot="input-otp"]',
    ) as HTMLElement;
    expect(field.hasAttribute("data-sentry-block")).toBe(true);
    expect(within(field).getAllByRole("textbox")).toHaveLength(6);
    await typeCode(field, "654321");
    const pending = deferred<{ ok: true }>();
    mfa.verifyCode.mockReturnValue(pending.promise);
    const verify = screen.getByRole("button", { name: "Verify" });
    const form = verify.closest("form")!;
    fireEvent.click(verify);
    fireEvent.click(verify);
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(mfa.verifyCode).toHaveBeenCalledTimes(1);
    expect(mfa.verifyCode).toHaveBeenCalledWith("v1", "654321");
    mfa.readFactorState.mockResolvedValue({
      kind: "area",
      factors: [factorRow("v1", "Authenticator 1")],
    });
    await act(async () => pending.resolve({ ok: true }));
    expect(await screen.findByText(VERIFIED)).toBeTruthy();
    expect(mfa.verifyCode).toHaveBeenCalledTimes(1);
  });

  it("tries each verified authenticator in turn until one accepts the code", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1", "v2"],
    });
    render(<OperatorAreaClient />);
    await screen.findByText("Enter your code");
    await typeCode(
      document.querySelector('[data-slot="input-otp"]') as HTMLElement,
      "111111",
    );
    mfa.verifyCode
      .mockResolvedValueOnce({
        ok: false,
        message:
          "That code did not match. Check that your device's clock is right and enter the current code.",
        reread: false,
        mismatch: true,
      })
      .mockResolvedValueOnce({ ok: true });
    mfa.readFactorState.mockResolvedValue({
      kind: "area",
      factors: [factorRow("v1", "A"), factorRow("v2", "B")],
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect(await screen.findByText(VERIFIED)).toBeTruthy();
    expect(mfa.verifyCode.mock.calls).toEqual([
      ["v1", "111111"],
      ["v2", "111111"],
    ]);
  });

  it("shows the fixed text for a refused code and re-reads the state on insufficient_aal", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1"],
    });
    render(<OperatorAreaClient />);
    await screen.findByText("Enter your code");
    const field = document.querySelector(
      '[data-slot="input-otp"]',
    ) as HTMLElement;
    await typeCode(field, "000000");
    mfa.verifyCode.mockResolvedValueOnce({
      ok: false,
      message: "Your network changed during verification. Enter a new code.",
      reread: false,
      mismatch: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect(
      await screen.findByText(
        "Your network changed during verification. Enter a new code.",
      ),
    ).toBeTruthy();
    await typeCode(field, "000001");
    mfa.verifyCode.mockResolvedValueOnce({
      ok: false,
      message: "",
      reread: true,
      mismatch: false,
    });
    const reads = mfa.readFactorState.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    await waitFor(() =>
      expect(mfa.readFactorState.mock.calls.length).toBe(reads + 1),
    );
  });

  it("explains what to do about a lost authenticator and offers nothing more", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1"],
    });
    render(<OperatorAreaClient />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Lost your authenticator?" }),
    );
    expect(
      screen.getByText(
        "Ask the release owner to remove the lost factor and end your other sessions. You then set up a new authenticator here.",
      ),
    ).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/recovery code/i);
  });

  it("lists the verified authenticators and offers no Remove while only one exists", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "area",
      factors: [factorRow("v1", "Authenticator 2026-11-20 10:00:00 UTC")],
    });
    render(<OperatorAreaClient />);
    expect(await screen.findByText(VERIFIED)).toBeTruthy();
    expect(
      screen.getByText("Authenticator 2026-11-20 10:00:00 UTC"),
    ).toBeTruthy();
    expect(screen.getByText(/^Added /)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Add another authenticator" }),
    ).toBeTruthy();
  });

  it("removes one of two authenticators after confirmation, then reads the state again", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "area",
      factors: [factorRow("v1", "Phone"), factorRow("v2", "Laptop")],
    });
    render(<OperatorAreaClient />);
    await screen.findByText(VERIFIED);
    const removes = screen.getAllByRole("button", { name: /^Remove/ });
    expect(removes).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Remove Laptop" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Remove Laptop?")).toBeTruthy();
    expect(
      within(dialog).getByText(
        "You will no longer be able to sign in to the operator area with this authenticator.",
      ),
    ).toBeTruthy();
    mfa.removeFactor.mockResolvedValue({ ok: true });
    mfa.readFactorState.mockResolvedValue({
      kind: "area",
      factors: [factorRow("v1", "Phone")],
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(mfa.removeFactor).toHaveBeenCalledWith("v2"));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull(),
    );
    expect(mfa.readFactorState).toHaveBeenCalledTimes(2);
  });

  it("shows the database's refusal, never verified, with a way to sign out", async () => {
    mfa.readFactorState.mockResolvedValue({ kind: "refused" });
    render(<OperatorAreaClient />);
    expect(await screen.findByText(REFUSED)).toBeTruthy();
    expect(document.body.textContent).not.toContain(VERIFIED);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() =>
      expect(session.signOutClientSession).toHaveBeenCalledTimes(1),
    );
  });

  it("shows the fixed text when the state cannot be read", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "failed",
      message: "Something went wrong. Try again.",
    });
    render(<OperatorAreaClient />);
    expect(
      await screen.findByText("Something went wrong. Try again."),
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain(VERIFIED);
  });

  it("enrols another authenticator from the area and keeps its key only while enrolling", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "area",
      factors: [factorRow("v1", "Phone")],
    });
    render(<OperatorAreaClient />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Add another authenticator" }),
    );
    await screen.findByRole("img", {
      name: "QR code for your authenticator app",
    });
    expect(document.body.innerHTML).toContain(secret.slice(0, 4));
    mfa.removeFactor.mockResolvedValue({ ok: true });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(mfa.removeFactor).toHaveBeenCalledWith("new-factor"),
    );
    await waitFor(() => expectSecretAbsent());
    expectNothingLeaked();
  });
});

const GENERIC = "Something went wrong. Try again.";
const RATE_LIMITED =
  "Too many attempts from this network. Wait a minute, then enter a new code.";
const MISMATCH =
  "That code did not match. Check that your device's clock is right and enter the current code.";

function codeForm(): { field: HTMLElement; form: HTMLFormElement } {
  const field = document.querySelector(
    '[data-slot="input-otp"]',
  ) as HTMLElement;
  return { field, form: field.closest("form")! };
}

async function showArea(factors: ReturnType<typeof factorRow>[]) {
  mfa.readFactorState.mockResolvedValue({ kind: "area", factors });
  render(<OperatorAreaClient />);
  await screen.findByText(VERIFIED);
}

async function confirmRemovalOf(name: string) {
  fireEvent.click(screen.getByRole("button", { name: `Remove ${name}` }));
  const dialog = await screen.findByRole("alertdialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));
}

describe("AL-2675 WP2c part 2a, fix round: the operator area's screens", () => {
  it("R4: stops at the first authenticator when Auth refuses for a reason other than a wrong code, and shows that reason", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1", "v2"],
    });
    render(<OperatorAreaClient />);
    await screen.findByText("Enter your code");
    await typeCode(codeForm().field, "222222");
    mfa.verifyCode.mockResolvedValue({
      ok: false,
      message: RATE_LIMITED,
      reread: false,
      mismatch: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect(await screen.findByText(RATE_LIMITED)).toBeTruthy();
    expect(mfa.verifyCode).toHaveBeenCalledTimes(1);
  });

  it("R4: shows the wrong-code text when every authenticator refuses the code", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1", "v2"],
    });
    render(<OperatorAreaClient />);
    await screen.findByText("Enter your code");
    await typeCode(codeForm().field, "333333");
    mfa.verifyCode.mockResolvedValue({
      ok: false,
      message: MISMATCH,
      reread: false,
      mismatch: true,
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect(await screen.findByText(MISMATCH)).toBeTruthy();
    expect(mfa.verifyCode).toHaveBeenCalledTimes(2);
  });

  it("R5: drops the pending key and QR before reading the state again when a verification asks for it", async () => {
    await openEnrolment();
    mfa.verifyCode.mockResolvedValue({
      ok: false,
      message: "",
      reread: true,
      mismatch: false,
    });
    await typeCode(codeForm().field, "123456");
    fireEvent.click(
      screen.getByRole("button", { name: "Verify and continue" }),
    );
    await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalledTimes(2));
    await waitFor(() => expectSecretAbsent());
    expect(
      await screen.findByRole("button", { name: "Set up an authenticator" }),
    ).toBeTruthy();
    expectNothingLeaked();
  });

  it("R5: never sends a code with fewer than six digits, however the form is submitted", async () => {
    await openEnrolment();
    const enrolment = codeForm();
    await typeCode(enrolment.field, "12345");
    fireEvent.submit(enrolment.form);
    cleanup();
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1"],
    });
    render(<OperatorAreaClient />);
    await screen.findByText("Enter your code");
    const challenge = codeForm();
    await typeCode(challenge.field, "12345");
    fireEvent.submit(challenge.form);
    await act(async () => undefined);
    expect(mfa.verifyCode).not.toHaveBeenCalled();
  });

  it("B1: offers no second removal until the new list is on the screen", async () => {
    await showArea([factorRow("v1", "Phone"), factorRow("v2", "Laptop")]);
    const nextList = deferred<{ kind: "area"; factors: unknown[] }>();
    mfa.removeFactor.mockResolvedValue({ ok: true });
    mfa.readFactorState.mockReturnValueOnce(nextList.promise);
    await confirmRemovalOf("Laptop");
    await waitFor(() => expect(mfa.removeFactor).toHaveBeenCalledWith("v2"));
    await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Phone")).toBeTruthy();
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toEqual([]);
    await act(async () =>
      nextList.resolve({ kind: "area", factors: [factorRow("v1", "Phone")] }),
    );
    expect(screen.queryByText("Laptop")).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toEqual([]);
    expect(mfa.removeFactor).toHaveBeenCalledTimes(1);
  });

  it("B2: says so when a removal did not happen, and offers the controls again", async () => {
    await showArea([factorRow("v1", "Phone"), factorRow("v2", "Laptop")]);
    mfa.removeFactor.mockResolvedValue({
      ok: false,
      message: GENERIC,
      reread: false,
      mismatch: false,
    });
    await confirmRemovalOf("Laptop");
    expect(await screen.findByText(GENERIC)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(2);
    expect(screen.getByText("Laptop")).toBeTruthy();
  });

  it("B2: reads the list again, and invites no second removal, when the factor went but the refresh failed", async () => {
    await showArea([factorRow("v1", "Phone"), factorRow("v2", "Laptop")]);
    const nextList = deferred<{ kind: "area"; factors: unknown[] }>();
    mfa.removeFactor.mockResolvedValue({
      ok: false,
      message: GENERIC,
      reread: true,
      mismatch: false,
    });
    mfa.readFactorState.mockReturnValueOnce(nextList.promise);
    await confirmRemovalOf("Laptop");
    await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalledTimes(2));
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toEqual([]);
    await act(async () =>
      nextList.resolve({ kind: "area", factors: [factorRow("v1", "Phone")] }),
    );
    expect(screen.queryByText("Laptop")).toBeNull();
    expect(mfa.removeFactor).toHaveBeenCalledTimes(1);
  });

  it("B3: keeps the key hidden and says so when Cancel could not remove the pending factor", async () => {
    await openEnrolment();
    mfa.removeFactor.mockResolvedValue({
      ok: false,
      message: GENERIC,
      reread: false,
      mismatch: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText(GENERIC)).toBeTruthy();
    expectSecretAbsent();
    expect(
      screen.getByRole("button", { name: "Set up an authenticator" }),
    ).toBeTruthy();
    expectNothingLeaked();
  });

  it("B4: sends no verification once sign-out has begun, and hides the challenge", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1", "v2"],
    });
    render(<OperatorAreaClient />);
    await screen.findByText("Enter your code");
    await typeCode(codeForm().field, "444444");
    const firstVerify = deferred<unknown>();
    mfa.verifyCode.mockReturnValueOnce(firstVerify.promise);
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect(mfa.verifyCode).toHaveBeenCalledTimes(1);
    const signingOut = deferred<{ ok: true; redirected: true }>();
    session.signOutClientSession.mockReturnValueOnce(signingOut.promise);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(screen.queryByText("Enter your code")).toBeNull();
    await act(async () =>
      firstVerify.resolve({
        ok: false,
        message: MISMATCH,
        reread: false,
        mismatch: true,
      }),
    );
    expect(mfa.verifyCode).toHaveBeenCalledTimes(1);
  });

  it("B5: shows the screen again when sign-out finishes without leaving the page", async () => {
    mfa.readFactorState.mockResolvedValue({ kind: "enrol" });
    session.signOutClientSession.mockResolvedValue({
      ok: true,
      redirected: false,
    });
    render(<OperatorAreaClient />);
    await screen.findByRole("button", { name: "Set up an authenticator" });
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() =>
      expect(session.signOutClientSession).toHaveBeenCalledTimes(1),
    );
    expect(
      await screen.findByRole("button", { name: "Set up an authenticator" }),
    ).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Sign out" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
});

const TWO_FACTORS = () => [factorRow("v1", "Phone"), factorRow("v2", "Laptop")];

async function startRereadFromArea() {
  const earlier = deferred<unknown>();
  mfa.readFactorState.mockReturnValueOnce(earlier.promise);
  mfa.startEnrolment.mockResolvedValueOnce({
    ok: false,
    message: "",
    reread: true,
    mismatch: false,
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Add another authenticator" }),
  );
  await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalledTimes(2));
  return earlier;
}

describe("AL-2675 WP2c part 2a, closing list: the operator area's screens", () => {
  it("F1: offers and confirms no removal while one is pending, though an earlier read resolves in between", async () => {
    await showArea(TWO_FACTORS());
    const earlier = await startRereadFromArea();
    const fresh = deferred<unknown>();
    mfa.readFactorState.mockReturnValueOnce(fresh.promise);
    const removal = deferred<unknown>();
    mfa.removeFactor.mockReturnValueOnce(removal.promise);
    await confirmRemovalOf("Phone");
    await waitFor(() => expect(mfa.removeFactor).toHaveBeenCalledWith("v1"));
    await act(async () =>
      earlier.resolve({ kind: "area", factors: TWO_FACTORS() }),
    );
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toEqual([]);
    await act(async () => removal.resolve({ ok: true }));
    await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalledTimes(3));
    expect(screen.queryAllByRole("button", { name: /^Remove / })).toEqual([]);
    await act(async () =>
      fresh.resolve({ kind: "area", factors: [factorRow("v2", "Laptop")] }),
    );
    expect(screen.queryByText("Phone")).toBeNull();
    expect(mfa.removeFactor).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["accepts the code", { ok: true }],
    [
      "asks for a fresh read",
      { ok: false, message: "", reread: true, mismatch: false },
    ],
  ])(
    "F10: a challenge that %s after sign-out has begun does nothing more",
    async (_label, answer) => {
      mfa.readFactorState.mockResolvedValue({
        kind: "challenge",
        factorIds: ["v1"],
      });
      render(<OperatorAreaClient />);
      await screen.findByText("Enter your code");
      await typeCode(codeForm().field, "555555");
      const verify = deferred<unknown>();
      mfa.verifyCode.mockReturnValueOnce(verify.promise);
      fireEvent.click(screen.getByRole("button", { name: "Verify" }));
      session.signOutClientSession.mockReturnValueOnce(
        new Promise(() => undefined),
      );
      fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
      await act(async () => verify.resolve(answer));
      expect(mfa.readFactorState).toHaveBeenCalledTimes(1);
    },
  );

  it("F10: an enrolment whose verification resolves after its panel is gone does nothing more", async () => {
    await openEnrolment();
    await typeCode(codeForm().field, "565656");
    const verify = deferred<unknown>();
    mfa.verifyCode.mockReturnValueOnce(verify.promise);
    fireEvent.click(
      screen.getByRole("button", { name: "Verify and continue" }),
    );
    session.signOutClientSession.mockReturnValueOnce(
      new Promise(() => undefined),
    );
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    await act(async () => verify.resolve({ ok: true }));
    expect(mfa.readFactorState).toHaveBeenCalledTimes(1);
  });

  it("F10: after a failed sign-out, a challenge whose panel is gone goes on to no other authenticator", async () => {
    mfa.readFactorState.mockResolvedValue({
      kind: "challenge",
      factorIds: ["v1", "v2"],
    });
    render(<OperatorAreaClient />);
    await screen.findByText("Enter your code");
    await typeCode(codeForm().field, "666666");
    const firstVerify = deferred<unknown>();
    mfa.verifyCode.mockReturnValueOnce(firstVerify.promise);
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));
    session.signOutClientSession.mockResolvedValueOnce({
      ok: false,
      message: GENERIC,
      redirected: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(await screen.findByText("Enter your code")).toBeTruthy();
    mfa.verifyCode.mockResolvedValue({
      ok: false,
      message: MISMATCH,
      reread: false,
      mismatch: true,
    });
    await act(async () =>
      firstVerify.resolve({
        ok: false,
        message: MISMATCH,
        reread: false,
        mismatch: true,
      }),
    );
    expect(mfa.verifyCode).toHaveBeenCalledTimes(1);
  });

  it("F11: keeps an open second enrolment's key and QR when the list is read again", async () => {
    await showArea(TWO_FACTORS());
    fireEvent.click(
      screen.getByRole("button", { name: "Add another authenticator" }),
    );
    await screen.findByRole("img", {
      name: "QR code for your authenticator app",
    });
    const fresh = deferred<unknown>();
    mfa.readFactorState.mockReturnValueOnce(fresh.promise);
    mfa.removeFactor.mockResolvedValueOnce({ ok: true });
    await confirmRemovalOf("Phone");
    await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalledTimes(2));
    await act(async () =>
      fresh.resolve({ kind: "area", factors: [factorRow("v2", "Laptop")] }),
    );
    expect(screen.queryByText("Phone")).toBeNull();
    expect(
      screen.getByRole("img", { name: "QR code for your authenticator app" }),
    ).toBeTruthy();
    expect(document.body.innerHTML).toContain(secret.slice(0, 4));
  });

  it("F11: keeps a message just shown when an earlier read resolves", async () => {
    await showArea(TWO_FACTORS());
    const earlier = await startRereadFromArea();
    mfa.removeFactor.mockResolvedValueOnce({
      ok: false,
      message: GENERIC,
      reread: false,
      mismatch: false,
    });
    await confirmRemovalOf("Phone");
    expect(await screen.findByText(GENERIC)).toBeTruthy();
    await act(async () =>
      earlier.resolve({ kind: "area", factors: TWO_FACTORS() }),
    );
    expect(screen.getByText(GENERIC)).toBeTruthy();
  });
});

const HISTORY_TITLE = "Changes with no organization";
const HISTORY_EMPTY = "No change has been recorded with no organization.";
const HISTORY_REFUSED =
  "The database refused this history. Sign out and sign in again.";
const HISTORY_FAILED = "The history could not be loaded.";

function historyRow(id: string, action: string, createdAt: string) {
  return {
    id,
    createdAt,
    action,
    result: "succeeded",
    identityMode: "admin",
    actorId: "operator:wren",
    policyId: "eve.governance",
    changeSummary: `${action} changed`,
    decisionSummary: "Allowed",
  };
}

async function showAreaWithHistory() {
  mfa.readFactorState.mockResolvedValue({
    kind: "area",
    factors: [factorRow("v1", "Phone")],
  });
  render(<OperatorAreaClient />);
  await screen.findByText(VERIFIED);
}

describe("AL-2675 WP2c rest: the history with no organization in the operator area", () => {
  it.each([
    ["enrolment", { kind: "enrol" }],
    ["the challenge", { kind: "challenge", factorIds: ["v1"] }],
    ["the database's refusal", { kind: "refused" }],
    [
      "a failed read",
      { kind: "failed", message: "Something went wrong. Try again." },
    ],
  ])("reads and shows no history on %s", async (_state, state) => {
    mfa.readFactorState.mockResolvedValue(state);
    render(<OperatorAreaClient />);
    await waitFor(() => expect(mfa.readFactorState).toHaveBeenCalled());
    await act(async () => undefined);
    expect(mfa.readPlatformHistory).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: HISTORY_TITLE })).toBeNull();
  });

  it("lists the changes newest first once the session is confirmed", async () => {
    mfa.readPlatformHistory.mockResolvedValue({
      kind: "rows",
      rows: [
        historyRow("h2", "kill_switch.global.set", "2026-11-27T10:00:00Z"),
        historyRow("h1", "model_policy.global.update", "2026-11-26T10:00:00Z"),
      ],
    });
    await showAreaWithHistory();
    const heading = await screen.findByRole("heading", {
      level: 2,
      name: HISTORY_TITLE,
    });
    const list = await screen.findByRole("list", { name: HISTORY_TITLE });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]!.textContent).toContain("kill_switch.global.set");
    expect(items[0]!.textContent).toContain("kill_switch.global.set changed");
    expect(items[0]!.textContent).toContain("operator:wren");
    expect(items[1]!.textContent).toContain("model_policy.global.update");
    expect(within(items[0]!).getByText(/2026/).tagName).toBe("TIME");
    expect(heading).toBeTruthy();
    expect(mfa.readPlatformHistory).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
  });

  it("says so when nothing has been recorded with no organization", async () => {
    await showAreaWithHistory();
    expect(await screen.findByText(HISTORY_EMPTY)).toBeTruthy();
    expect(screen.queryByText(HISTORY_REFUSED)).toBeNull();
  });

  it("shows a refusal as refused, never as an empty history", async () => {
    mfa.readPlatformHistory.mockResolvedValue({ kind: "refused" });
    await showAreaWithHistory();
    expect(await screen.findByText(HISTORY_REFUSED)).toBeTruthy();
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
    expect(screen.queryByRole("list", { name: HISTORY_TITLE })).toBeNull();
  });

  it("shows a failed read as failed, never as an empty history, and reads again on request", async () => {
    mfa.readPlatformHistory.mockResolvedValueOnce({ kind: "failed" });
    await showAreaWithHistory();
    expect(await screen.findByText(HISTORY_FAILED)).toBeTruthy();
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
    mfa.readPlatformHistory.mockResolvedValueOnce({
      kind: "rows",
      rows: [
        historyRow("h1", "kill_switch.global.set", "2026-11-27T10:00:00Z"),
      ],
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Load the history again" }),
    );
    expect(
      await screen.findByRole("list", { name: HISTORY_TITLE }),
    ).toBeTruthy();
    expect(screen.queryByText(HISTORY_FAILED)).toBeNull();
    expect(mfa.readPlatformHistory).toHaveBeenCalledTimes(2);
  });

  it("shows a busy placeholder, and no empty text, while the history loads", async () => {
    mfa.readPlatformHistory.mockReturnValue(new Promise(() => undefined));
    await showAreaWithHistory();
    const region = await screen.findByRole("region", { name: HISTORY_TITLE });
    expect(region.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText(HISTORY_EMPTY)).toBeNull();
    expect(screen.queryByText(HISTORY_REFUSED)).toBeNull();
  });
});
