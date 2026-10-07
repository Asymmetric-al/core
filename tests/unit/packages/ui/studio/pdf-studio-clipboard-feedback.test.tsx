/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PDFStudioSetupStatus } from "../../../../../packages/ui/components/studio/PDFStudioSetupStatus";

vi.mock("@asym/config/pdf-studio", () => ({
  getPDFStudioSetupStatus: () => ({
    status: "not_configured",
    message: "Configure the PDF editor",
    features: [],
    missingFeatures: [],
    setupUrl: "https://example.com/setup",
  }),
  getUnlayerAccountConfig: () => ({
    environment: "development",
    projectId: null,
    allowedDomains: [],
    isConfigured: false,
    isWhiteLabel: false,
  }),
  PDF_STUDIO_SETUP_INSTRUCTIONS: {
    steps: [
      {
        step: 1,
        title: "Set project ID",
        description: "Add the project setting",
        code: "NEXT_PUBLIC_UNLAYER_PROJECT_ID=123456",
      },
    ],
    whiteLabelSteps: [],
  },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function openSetup() {
  render(<PDFStudioSetupStatus />);
  fireEvent.click(screen.getByRole("button", { name: "Free Mode" }));
  await screen.findByRole("dialog", { name: "PDF Studio Configuration" });
}

describe("PDF Studio clipboard feedback", () => {
  it("names the copy action and reports success only after the clipboard resolves", async () => {
    let resolveCopy!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCopy = resolve;
        }),
    );
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    await openSetup();
    fireEvent.click(
      screen.getByRole("button", { name: "Copy Set project ID setting" }),
    );
    expect(writeText).toHaveBeenCalledWith(
      "NEXT_PUBLIC_UNLAYER_PROJECT_ID=123456",
    );
    expect(screen.queryByText("Setting copied to clipboard.")).toBeNull();
    await act(async () => resolveCopy());
    expect(
      await screen.findByText("Setting copied to clipboard."),
    ).toBeTruthy();
  });

  it("reports clipboard failure without a successful copy announcement", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("Clipboard denied"));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    await openSetup();
    fireEvent.click(
      screen.getByRole("button", { name: "Copy Set project ID setting" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "Could not copy the setting. Select the code and copy it manually.",
      ),
    );
    expect(screen.queryByText("Setting copied to clipboard.")).toBeNull();
  });
});
