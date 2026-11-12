/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  countWords,
  EditorWordCount,
} from "../../../../../../../packages/ui/components/shadcn/rich-text-editor/word-count";

afterEach(cleanup);

describe("countWords", () => {
  it("counts words the way a writer would", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("We opened the new classroom!")).toBe(5);
    expect(countWords("Pim’s class can’t wait — 100 books.")).toBe(6);
    expect(countWords("Chiang Mai\n\nเชียงใหม่ 2026")).toBe(4);
  });
});

describe("EditorWordCount", () => {
  it("renders nothing outside an editor", () => {
    const { container } = render(<EditorWordCount />);
    expect(container.textContent).toBe("");
  });
});
