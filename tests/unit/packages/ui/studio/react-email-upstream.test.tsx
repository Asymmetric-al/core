/** @vitest-environment jsdom */

import { act, cleanup, render, waitFor } from "@testing-library/react";
import { createRef, Suspense } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReactEmailEditor } from "../../../../../packages/ui/components/studio/ReactEmailEditor";

import type { ComponentType } from "react";

import type { EmailStudioEditorHandle } from "../../../../../packages/email/email-builder-types";

// Next's client loader is the only substitution: the native upstream editor,
// extensions, schema and email serializer all execute in this fixture.
vi.mock("next/dynamic", async () => {
  const React = await import("react");
  return {
    default: (loader: () => Promise<ComponentType>) =>
      React.lazy(async () => ({ default: await loader() })),
  };
});

afterEach(() => cleanup());

describe("native React Email upstream contract", () => {
  it("loads and serializes a stored merge-tag template as HTML, text and JSON", async () => {
    const ref = createRef<EmailStudioEditorHandle>();
    const onReady = vi.fn();
    const design = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Dear " },
            {
              type: "mergeTag",
              attrs: { key: "first_name", label: "First name" },
            },
            { type: "text", text: ", thank you for giving." },
          ],
        },
      ],
    };
    render(
      <Suspense fallback={<span>Loading native editor</span>}>
        <ReactEmailEditor ref={ref} initialDesign={design} onReady={onReady} />
      </Suspense>,
    );
    await waitFor(() => expect(onReady).toHaveBeenCalled(), { timeout: 10000 });

    const saved = await ref.current?.exportDesign();
    expect(JSON.stringify(saved)).toContain('"type":"mergeTag"');
    expect(JSON.stringify(saved)).toContain('"key":"first_name"');
    const exported = await ref.current?.exportEmail({
      subject: "Field update",
      preheader: "Giving news",
    });
    expect(exported?.html).toContain("{{first_name}}");
    expect(exported?.text).toContain(
      "Dear {{first_name}}, thank you for giving.",
    );
    expect(exported?.subject).toBe("Field update");

    await act(async () => ref.current?.loadDesign(JSON.stringify(saved)));
    expect(await ref.current?.exportDesign()).toEqual(saved);
    expect((await ref.current?.exportEmail())?.text).toContain(
      "{{first_name}}",
    );
  });
});
