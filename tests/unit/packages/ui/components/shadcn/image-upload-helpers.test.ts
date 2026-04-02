import { describe, expect, it, vi } from "vitest";

import {
  composeEventHandlers,
  isKeyboardClickKey,
} from "../../../../../../packages/ui/components/shadcn/image-upload-helpers";

describe("image-upload helpers", () => {
  it("runs both handlers when the consumer handler does not cancel the event", () => {
    const consumerHandler = vi.fn();
    const internalHandler = vi.fn();
    const event = { defaultPrevented: false };

    composeEventHandlers(consumerHandler, internalHandler)(event);

    expect(consumerHandler).toHaveBeenCalledWith(event);
    expect(internalHandler).toHaveBeenCalledWith(event);
  });

  it("does not run the internal handler after the consumer handler prevents the event", () => {
    const consumerHandler = vi.fn((event: { defaultPrevented: boolean }) => {
      event.defaultPrevented = true;
    });
    const internalHandler = vi.fn();
    const event = { defaultPrevented: false };

    composeEventHandlers(consumerHandler, internalHandler)(event);

    expect(consumerHandler).toHaveBeenCalledWith(event);
    expect(internalHandler).not.toHaveBeenCalled();
  });

  it("treats Enter and Space as keyboard activation keys", () => {
    expect(isKeyboardClickKey("Enter")).toBe(true);
    expect(isKeyboardClickKey(" ")).toBe(true);
    expect(isKeyboardClickKey("Escape")).toBe(false);
  });
});
