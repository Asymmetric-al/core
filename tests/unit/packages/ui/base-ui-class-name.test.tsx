// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../packages/ui/components/shadcn/collapsible";
import { mergeBaseUIClassName } from "../../../../packages/ui/lib/base-ui";

afterEach(cleanup);

describe("Base UI className merging", () => {
  it("keeps static classes as a string and lets caller classes override defaults", () => {
    expect(mergeBaseUIClassName("px-2 text-sm", "px-4 caller")).toBe(
      "text-sm px-4 caller",
    );
    expect(mergeBaseUIClassName("base")).toBe("base");
  });

  it("defers state callbacks and preserves their full state", () => {
    const callback = vi.fn((state: { open: boolean; disabled: boolean }) =>
      state.open ? "px-4 is-open" : undefined,
    );
    const className = mergeBaseUIClassName("px-2 baseline", callback);
    expect(callback).not.toHaveBeenCalled();
    expect(typeof className).toBe("function");
    if (typeof className !== "function")
      throw new Error("State callback was lost");
    const state = { open: true, disabled: false };
    expect(className(state)).toBe("baseline px-4 is-open");
    expect(callback).toHaveBeenCalledWith(state);
    expect(className({ open: false, disabled: false })).toBe("px-2 baseline");
  });

  it("recomputes classes when Base UI state changes without breaking render refs or handlers", () => {
    const ref = createRef<HTMLButtonElement>();
    const renderedRef = createRef<HTMLButtonElement>();
    const consumerClick = vi.fn();
    const renderedClick = vi.fn();
    render(
      <Collapsible>
        <CollapsibleTrigger
          ref={ref}
          className={mergeBaseUIClassName("px-2 baseline", (state) =>
            state.open ? "px-4 expanded" : "collapsed",
          )}
          onClick={consumerClick}
          render={
            <button
              ref={renderedRef}
              className="rendered"
              onClick={renderedClick}
            />
          }
        >
          Toggle content
        </CollapsibleTrigger>
        <CollapsibleContent>Revealed content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Toggle content" });
    expect(trigger.className).toContain("collapsed");
    expect(trigger.className).toContain("rendered");
    expect(ref.current).toBe(trigger);
    expect(renderedRef.current).toBe(trigger);
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.className).toContain("expanded");
    expect(trigger.className).toContain("px-4");
    expect(trigger.className).not.toContain("px-2");
    expect(trigger.className).toContain("baseline");
    expect(consumerClick).toHaveBeenCalledOnce();
    expect(renderedClick).toHaveBeenCalledOnce();
  });

  it("preserves consumers' cancellation of Base UI event handling", () => {
    const renderedClick = vi.fn();
    render(
      <Collapsible>
        <CollapsibleTrigger
          className={mergeBaseUIClassName("baseline", (state) =>
            state.open ? "expanded" : "collapsed",
          )}
          onClick={(event) => event.preventBaseUIHandler()}
          render={<button onClick={renderedClick} />}
        >
          Keep closed
        </CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Keep closed" });
    fireEvent.click(trigger);
    expect(renderedClick).toHaveBeenCalledOnce();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.className).toContain("collapsed");
  });
});
