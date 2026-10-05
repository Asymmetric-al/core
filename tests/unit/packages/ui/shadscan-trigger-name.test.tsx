/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { Button } from "../../../../packages/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../packages/ui/components/shadcn/dropdown-menu";

afterEach(cleanup);

it("passes the trigger's accessible name to its actual icon-only render Button", async () => {
  const view = render(
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open actions"
        render={
          <Button size="icon" variant="ghost">
            <svg aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuItem>Edit record</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const trigger = view.getByRole("button", { name: "Open actions" });
  expect(trigger.textContent?.trim()).toBe("");
  expect(trigger.getAttribute("aria-label")).toBe("Open actions");
  fireEvent.click(trigger);
  expect(
    await view.findByRole("menuitem", { name: "Edit record" }),
  ).toBeTruthy();
});
