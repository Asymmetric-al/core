// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../packages/ui/components/shadcn/tabs";

afterEach(() => {
  cleanup();
});

describe("Tabs", () => {
  it("marks the selected tab with data-active and routes value changes", () => {
    const onValueChange = vi.fn();

    render(
      <Tabs value="overview" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>,
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const detailsTab = screen.getByRole("tab", { name: "Details" });

    expect(overviewTab.getAttribute("data-active")).toBe("");
    expect(detailsTab.getAttribute("data-active")).toBeNull();

    fireEvent.click(detailsTab);

    expect(onValueChange).toHaveBeenCalledWith("details", expect.any(Object));
  });
});
