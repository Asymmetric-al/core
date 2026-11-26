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
