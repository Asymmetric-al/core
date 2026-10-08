// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImageUpload } from "../../../../packages/ui/components/primitives/image-upload";

afterEach(cleanup);

describe("image removal follows the upload control state", () => {
  it("preserves the existing image when the upload control is disabled", () => {
    const onRemove = vi.fn();
    const onChange = vi.fn();
    render(
      <ImageUpload
        value="https://example.org/portrait.webp"
        onChange={onChange}
        onRemove={onRemove}
        disabled
      />,
    );
    const remove = screen.getByRole("button", { name: "Remove image" });
    fireEvent.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "Uploaded" })).toBeTruthy();
  });

  it("still permits removal when the control is enabled without submitting a form", () => {
    const onRemove = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ImageUpload
          value="https://example.org/portrait.webp"
          onChange={vi.fn()}
          onRemove={onRemove}
        />
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
