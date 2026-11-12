// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({
    alt,
    onError,
    src,
  }: {
    alt: string;
    onError?: () => void;
    src: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- AL-1931: Test double for next/image.
    <img alt={alt} src={src} onError={onError} data-testid="thumb" />
  ),
}));

const { UpdateRailThumbnail } =
  await import("../../../../apps/donor/features/donor/components/update-rail-thumbnail");

afterEach(cleanup);

describe("UpdateRailThumbnail", () => {
  it("shows the post image when it loads", () => {
    render(
      <UpdateRailThumbnail image="https://example.com/a.jpg" initials="SJ" />,
    );
    expect(screen.getByTestId("thumb")).toBeTruthy();
    expect(screen.queryByText("SJ")).toBeNull();
  });

  // Seeded and remote images can be unavailable; the rail must not show a
  // broken-image icon in that case.
  it("falls back to the author's initials when the image fails", () => {
    render(
      <UpdateRailThumbnail image="https://example.com/a.jpg" initials="SJ" />,
    );
    fireEvent.error(screen.getByTestId("thumb"));
    expect(screen.queryByTestId("thumb")).toBeNull();
    expect(screen.getByText("SJ")).toBeTruthy();
  });

  // The author's name follows in the row, so the initials tile is decorative
  // like the image it replaces (alt="").
  it("hides the initials fallback from assistive technology", () => {
    render(<UpdateRailThumbnail image={null} initials="SJ" />);
    expect(screen.getByText("SJ").getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the author's photo when the post has none", () => {
    const { container } = render(
      <UpdateRailThumbnail
        image={null}
        authorAvatar="https://images.unsplash.com/photo-author"
        initials="SJ"
      />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "photo-author",
    );
    expect(screen.queryByText("SJ")).toBeNull();
  });

  it("uses initials when the post has no image", () => {
    render(<UpdateRailThumbnail image={null} initials="SJ" />);
    expect(screen.getByText("SJ")).toBeTruthy();
  });
});
