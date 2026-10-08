// @vitest-environment jsdom

import {
  NotificationPreferencesMatrix,
  SettingsLayout,
} from "@asym/ui/components/settings";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { TabsContent } from "@asym/ui/components/shadcn/tabs";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal("innerWidth", 390);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("licensed settings compositions", () => {
  it("routes controlled tab changes to the existing caller-owned panels", () => {
    const onValueChange = vi.fn();

    function SettingsFixture() {
      const [value, setValue] = useState("profile");
      return (
        <SettingsLayout
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
          tabs={[
            { value: "profile", label: "Profile" },
            { value: "notifications", label: "Notifications" },
          ]}
        >
          <TabsContent value="profile">Existing profile fields</TabsContent>
          <TabsContent value="notifications">
            Existing notification controls
          </TabsContent>
        </SettingsLayout>
      );
    }

    render(<SettingsFixture />);
    expect(
      screen
        .getByRole("tab", { name: "Profile" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Notifications" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("notifications");
    expect(
      screen.getByRole("tabpanel", { name: "Notifications" }).textContent,
    ).toBe("Existing notification controls");
  });

  it.each([
    [390, "ArrowRight", "horizontal"],
    [1280, "ArrowDown", "vertical"],
  ] as const)(
    "uses the appropriate keyboard navigation at viewport %i",
    async (width, key, orientation) => {
      vi.stubGlobal("innerWidth", width);
      const onValueChange = vi.fn();
      render(
        <SettingsLayout
          value="profile"
          onValueChange={onValueChange}
          tabs={[
            { value: "profile", label: "Profile" },
            { value: "security", label: "Security" },
          ]}
        >
          <TabsContent value="profile">Profile fields</TabsContent>
          <TabsContent value="security">Security fields</TabsContent>
        </SettingsLayout>,
      );
      const list = screen.getByRole("tablist", { name: "Account settings" });
      expect(list.getAttribute("aria-orientation") ?? "horizontal").toBe(
        orientation,
      );
      const profile = screen.getByRole("tab", { name: "Profile" });
      const security = screen.getByRole("tab", { name: "Security" });
      act(() => profile.focus());
      fireEvent.keyDown(profile, { key });
      await waitFor(() => expect(document.activeElement).toBe(security));
      // Base UI focuses first; jsdom does not synthesize the native
      // keyboard activation click from Enter.
      fireEvent.click(security);
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("security");
    },
  );

  it("names matrix channels and rows while retaining caller-owned controls", () => {
    const onEmailChange = vi.fn();
    render(
      <NotificationPreferencesMatrix
        caption="Notification channel preferences"
        channels={[
          { id: "email", label: "Email" },
          { id: "sms", label: "SMS" },
        ]}
        rows={[
          {
            id: "gifts",
            title: "Gift updates",
            description: "Updates when a new gift arrives",
            controls: [
              <Switch
                key="email"
                aria-label="Gift updates via Email"
                checked={false}
                onCheckedChange={onEmailChange}
              />,
              <Switch key="sms" aria-label="Gift updates via SMS" checked />,
            ],
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("table", { name: "Notification channel preferences" }),
    ).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeTruthy();
    expect(
      screen.getByRole("rowheader", {
        name: "Gift updates Updates when a new gift arrives",
      }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("switch", { name: "Gift updates via Email" }),
    );
    expect(onEmailChange).toHaveBeenCalledExactlyOnceWith(
      true,
      expect.any(Object),
    );
    expect(
      screen
        .getByRole("switch", { name: "Gift updates via SMS" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });
});
