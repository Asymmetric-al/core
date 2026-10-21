/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef, useState, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@asym/ui/components/shadcn/accordion";
import { ButtonLink } from "@asym/ui/components/shadcn/button";
import { ChartContainer } from "@asym/ui/components/shadcn/chart";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { LegacyRichTextEditor } from "@asym/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor";

afterEach(cleanup);

describe("shared presentation APIs exposed by the current lint analyzer", () => {
  it("styles links through shared button variants without replacing anchor semantics", () => {
    const ref = createRef<HTMLAnchorElement>();
    const click = vi.fn((event) => event.preventDefault());
    function RouterLink(props: ComponentProps<"a">) {
      return <a {...props} />;
    }
    render(
      <ButtonLink
        ref={ref}
        variant="ghost"
        size="icon-sm"
        render={<RouterLink href="/web-studio/collections/pages" />}
        onClick={click}
        aria-label="Pages"
        aria-current="page"
      >
        P
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Pages" });
    expect(ref.current).toBe(link);
    expect(link.getAttribute("href")).toBe("/web-studio/collections/pages");
    expect(link.getAttribute("role")).toBeNull();
    expect(link.getAttribute("type")).toBeNull();
    expect(link.classList.contains("size-8")).toBe(true);
    expect(link.getAttribute("aria-current")).toBe("page");
    link.focus();
    expect(document.activeElement).toBe(link);
    fireEvent.click(link, { ctrlKey: true });
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.calls[0][0].ctrlKey).toBe(true);
    expect(screen.queryByRole("button", { name: "Pages" })).toBeNull();
  });

  it("keeps amount radios labelled, controlled, keyboard-selectable and outside form submission", async () => {
    const submitted = vi.fn((event) => event.preventDefault());
    function Amounts() {
      const [value, setValue] = useState(25);
      return (
        <form onSubmit={submitted}>
          <RadioGroup
            aria-label="Support amount"
            value={value}
            onValueChange={setValue}
          >
            <RadioGroupItem
              variant="amount"
              value={25}
              nativeButton
              render={<button />}
            >
              $25
            </RadioGroupItem>
            <RadioGroupItem
              variant="amount-compact"
              value={50}
              nativeButton
              render={<button />}
            >
              $50
            </RadioGroupItem>
          </RadioGroup>
        </form>
      );
    }
    render(<Amounts />);
    const first = screen.getByRole("radio", { name: "$25" });
    const second = screen.getByRole("radio", { name: "$50" });
    expect(first.getAttribute("aria-checked")).toBe("true");
    expect(second.getAttribute("type")).toBe("button");
    expect(first.classList.contains("h-24")).toBe(true);
    expect(second.classList.contains("py-2.5")).toBe(true);
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    await waitFor(() =>
      expect(second.getAttribute("aria-checked")).toBe("true"),
    );
    expect(document.activeElement).toBe(second);
    fireEvent.click(first);
    expect(first.getAttribute("aria-checked")).toBe("true");
    expect(submitted).not.toHaveBeenCalled();
  });

  it("retains the ordinary radio indicator and default size", () => {
    const { container } = render(
      <RadioGroup defaultValue="one">
        <RadioGroupItem value="one" aria-label="Ordinary radio" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio").classList.contains("size-4")).toBe(true);
    expect(
      container.querySelector('[data-slot="radio-group-indicator"]'),
    ).toBeTruthy();
  });

  it("offers fill sizing for definite-height chart parents while retaining the default aspect ratio", () => {
    const chart = (layout?: "fill") =>
      renderToStaticMarkup(
        <ChartContainer layout={layout} config={{}}>
          <div />
        </ChartContainer>,
      );
    expect(chart()).toContain("aspect-video");
    const filled = chart("fill");
    expect(filled).toContain("h-full aspect-auto");
    expect(filled).not.toContain("aspect-video");
  });

  it("keeps stored editor content, its label and bottom toolbar while the feed owns its density", () => {
    const changed = vi.fn();
    const { container } = render(
      <LegacyRichTextEditor
        variant="feed"
        aria-label="Post content"
        value={JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Stored update" }],
            },
          ],
        })}
        onChange={changed}
        toolbarPosition="bottom"
        actions={<button type="button">Publish update</button>}
        proseInvert={false}
      />,
    );
    const editable = container.querySelector('[contenteditable="true"]');
    expect(editable?.getAttribute("aria-label")).toBe("Post content");
    expect(editable?.textContent).toBe("Stored update");
    expect(editable?.classList.contains("sm:min-h-35")).toBe(true);
    const publish = screen.getByRole("button", { name: "Publish update" });
    expect(
      editable!.compareDocumentPosition(publish) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(changed).not.toHaveBeenCalled();
  });

  it("supports the FAQ card and opacity-only panel without changing disclosure semantics", () => {
    const { container } = render(
      <Accordion defaultValue={["one"]}>
        <AccordionItem value="one" variant="card">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent variant="faq" animation="none">
            Answer
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const item = container.querySelector('[data-slot="accordion-item"]');
    const panel = container.querySelector('[data-slot="accordion-content"]');
    expect(item?.classList.contains("rounded-2xl")).toBe(true);
    expect(panel?.className).not.toContain("animate-accordion");
    const trigger = screen.getByRole("button", { name: "Question" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
