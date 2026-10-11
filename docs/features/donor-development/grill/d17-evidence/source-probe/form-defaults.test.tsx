// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { useAsymForm } from "../../../../../../packages/ui/components/primitives/tanstack-form";

afterEach(cleanup);

type Defaults = { choice: string; note: string };

it("replaces an untouched form value when supplied defaultValues change", async () => {
  const { result, rerender } = renderHook(
    ({ defaults }: { defaults: Defaults }) => useAsymForm({ defaultValues: defaults }),
    { initialProps: { defaults: { choice: "list-a", note: "" } } },
  );
  expect(result.current.state.values.choice).toBe("list-a");
  expect(result.current.state.isTouched).toBe(false);
  rerender({ defaults: { choice: "list-b", note: "" } });
  await waitFor(() => expect(result.current.state.values.choice).toBe("list-b"));
  expect(result.current.state.isTouched).toBe(false);
});

it("does not apply a late default for a missing choice after an unrelated field is touched", async () => {
  const { result, rerender } = renderHook(
    ({ defaults }: { defaults: Defaults }) => useAsymForm({ defaultValues: defaults }),
    { initialProps: { defaults: { choice: "", note: "" } } },
  );
  act(() => result.current.setFieldValue("note", "Staff draft"));
  await waitFor(() => expect(result.current.state.isTouched).toBe(true));
  expect(result.current.state.values.choice).toBe("");
  rerender({ defaults: { choice: "list-a", note: "" } });
  expect(result.current.state.values).toEqual({ choice: "", note: "Staff draft" });
  expect(result.current.state.isTouched).toBe(true);
});
