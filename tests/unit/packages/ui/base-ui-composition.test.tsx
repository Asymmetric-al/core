// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ImageUpload } from "../../../../packages/ui/components/primitives/image-upload";
import { Badge } from "../../../../packages/ui/components/shadcn/badge";
import { BreadcrumbLink } from "../../../../packages/ui/components/shadcn/breadcrumb";
import { Button } from "../../../../packages/ui/components/shadcn/button";
import {
  ButtonGroupSeparator,
  ButtonGroupText,
} from "../../../../packages/ui/components/shadcn/button-group";
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from "../../../../packages/ui/components/shadcn/carousel";
import {
  Item,
  ItemSeparator,
} from "../../../../packages/ui/components/shadcn/item";
import {
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "../../../../packages/ui/components/shadcn/sidebar";

vi.mock("@asym/ui/hooks", () => ({ useIsMobile: () => false }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("shared Base UI composition", () => {
  it.each([
    ["Badge", Badge],
    ["BreadcrumbLink", BreadcrumbLink],
    ["ButtonGroupText", ButtonGroupText],
    ["Item", Item],
    ["SidebarGroupLabel", SidebarGroupLabel],
    ["SidebarMenuSubButton", SidebarMenuSubButton],
  ] as const)(
    "%s composes a render target's refs, attributes, handlers and styles",
    (_, Component) => {
      const ref = createRef<HTMLAnchorElement>();
      const targetRef = createRef<HTMLAnchorElement>();
      const calls: string[] = [];
      render(
        <Component
          ref={ref}
          className="caller"
          style={{ color: "red", marginTop: 2 }}
          onClick={() => calls.push("caller")}
          render={
            <a
              ref={targetRef}
              href="#destination"
              className="target"
              style={{ color: "blue" }}
              onClick={() => calls.push("target")}
            />
          }
        >
          Destination
        </Component>,
      );
      const link = screen.getByRole("link", { name: "Destination" });
      expect(ref.current).toBe(link);
      expect(targetRef.current).toBe(link);
      expect(link.getAttribute("href")).toBe("#destination");
      expect(link.classList.contains("caller")).toBe(true);
      expect(link.classList.contains("target")).toBe(true);
      expect(link.style.color).toBe("blue");
      expect(link.style.marginTop).toBe("2px");
      fireEvent.click(link);
      expect(calls).toEqual(["target", "caller"]);
    },
  );

  it("preserves a custom upload Button's state classes, name, disabled state and ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ImageUpload onChange={() => undefined}>
        <Button
          ref={ref}
          disabled
          aria-label="Choose portrait"
          className={(state) =>
            state.disabled ? "upload-disabled" : "upload-ready"
          }
        >
          +
        </Button>
      </ImageUpload>,
    );
    const button = screen.getByRole("button", { name: "Choose portrait" });
    expect(ref.current).toBe(button);
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.classList.contains("upload-disabled")).toBe(true);
  });

  it("honors Base UI handler cancellation before opening a custom upload picker", () => {
    const picker = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => undefined);
    render(
      <ImageUpload onChange={() => undefined}>
        <Button onClick={(event) => event.preventBaseUIHandler()}>
          Choose portrait
        </Button>
      </ImageUpload>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Choose portrait" }));
    expect(picker).not.toHaveBeenCalled();
    picker.mockRestore();
  });

  it("preserves sidebar render state and refs through tooltip composition", () => {
    const ref = createRef<HTMLButtonElement>();
    const renderTarget = vi.fn((props, state) => (
      <button {...props} data-render-size={state.size} />
    ));
    render(
      <SidebarProvider>
        <SidebarMenuButton
          ref={ref}
          size="lg"
          isActive
          tooltip="Projects"
          render={(props, state) => renderTarget(props, state)}
        >
          Projects
        </SidebarMenuButton>
      </SidebarProvider>,
    );
    const button = screen.getByRole("button", { name: "Projects" });
    expect(ref.current).toBe(button);
    expect(renderTarget).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slot: "sidebar-menu-button",
        size: "lg",
        active: "true",
      }),
    );
    expect(button.getAttribute("data-render-size")).toBe("lg");
  });

  it.each([
    ["group action", SidebarGroupAction],
    ["menu action", SidebarMenuAction],
    ["menu button", SidebarMenuButton],
  ] as const)(
    "the sidebar %s does not accidentally submit its containing form",
    (_, Component) => {
      const submit = vi.fn((event) => event.preventDefault());
      render(
        <SidebarProvider>
          <form onSubmit={submit}>
            <Component>Open tools</Component>
          </form>
        </SidebarProvider>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Open tools" }));
      expect(submit).not.toHaveBeenCalled();
    },
  );

  it("lets callers cancel sidebar toggling through the Base UI event contract", () => {
    const change = vi.fn();
    render(
      <SidebarProvider onOpenChange={change}>
        <SidebarTrigger onClick={(event) => event.preventBaseUIHandler()} />
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(change).not.toHaveBeenCalled();
  });

  it("preserves primitive className callbacks through separator compositions", () => {
    render(
      <>
        <ButtonGroupSeparator
          className={(state) => `group-${state.orientation}`}
        />
        <ItemSeparator className={(state) => `item-${state.orientation}`} />
        <SidebarSeparator
          className={(state) => `sidebar-${state.orientation}`}
        />
      </>,
    );
    expect(document.querySelector(".group-vertical")).not.toBeNull();
    expect(document.querySelector(".item-horizontal")).not.toBeNull();
    expect(document.querySelector(".sidebar-horizontal")).not.toBeNull();
  });

  it("preserves disabled state classes through sidebar and carousel compositions", () => {
    render(
      <>
        <SidebarProvider>
          <SidebarTrigger
            disabled
            className={(state) =>
              state.disabled ? "trigger-disabled" : "trigger-enabled"
            }
          />
          <SidebarInput
            aria-label="Search"
            disabled
            className={(state) =>
              state.disabled ? "input-disabled" : "input-enabled"
            }
          />
        </SidebarProvider>
        <Carousel>
          <CarouselPrevious
            className={(state) =>
              state.disabled ? "previous-disabled" : "previous-enabled"
            }
          />
          <CarouselNext
            className={(state) =>
              state.disabled ? "next-disabled" : "next-enabled"
            }
          />
        </Carousel>
      </>,
    );
    expect(document.querySelector(".trigger-disabled")).not.toBeNull();
    expect(document.querySelector(".input-disabled")).not.toBeNull();
    expect(document.querySelector(".previous-disabled")).not.toBeNull();
    expect(document.querySelector(".next-disabled")).not.toBeNull();
  });
});
