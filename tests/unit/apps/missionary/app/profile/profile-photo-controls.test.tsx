/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

const uploads = vi.hoisted(() => ({ paths: [] as string[] }));

// The upload dialog needs storage; record each uploader and render its trigger.
vi.mock("@asym/ui/components/primitives/image-upload", () => ({
  ImageUpload: ({
    children,
    path,
  }: {
    children: React.ReactNode;
    path: string;
  }) => {
    uploads.paths.push(path);
    return <>{children}</>;
  },
}));

import { initialProfile } from "../../../../../../apps/missionary/app/profile/profile-model";
import { ProfileFormColumn } from "../../../../../../apps/missionary/app/profile/profile-form-column";

afterEach(() => {
  cleanup();
  uploads.paths = [];
});

function show(avatarUrl: string) {
  render(
    <ProfileFormColumn
      profile={{ ...initialProfile, avatarUrl }}
      validationErrors={{}}
      bioWordCount={0}
      initials="JH"
      updateProfile={vi.fn()}
      onSave={vi.fn()}
    />,
  );
}

it("offers one clear way to change the profile picture", () => {
  show("https://example.test/jordan.jpg");
  expect(uploads.paths.filter((path) => path === "avatars")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Change photo" })).toBeTruthy();
});

it("asks for a first photo when there is none", () => {
  show("");
  expect(screen.getByRole("button", { name: "Upload photo" })).toBeTruthy();
});
