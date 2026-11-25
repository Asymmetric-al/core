import { describe, expect, it } from "vitest";

import { bodyFromPageCopy } from "../../e2e/helpers/received-bodies";

import type { PageCopy } from "../../e2e/helpers/received-bodies";

const response = { url: "POST /web-studio", status: 200 };

function copy(overrides: Partial<PageCopy>): PageCopy {
  return {
    method: "POST",
    url: "http://127.0.0.1/web-studio",
    status: 200,
    text: "",
    done: true,
    ...overrides,
  };
}

describe("a body the page copied", () => {
  it("is unread when the page's read of it failed half way", () => {
    expect(
      bodyFromPageCopy(
        response,
        copy({ text: '0:{"items":[{"title":"Alpha', error: "network error" }),
      ),
    ).toEqual({
      ...response,
      unread: "the page's read failed: network error",
    });
  });

  it("is unread when the page had not received it whole", () => {
    expect(
      bodyFromPageCopy(
        response,
        copy({ text: '0:{"items":[{"title":"Alpha', done: false }),
      ),
    ).toEqual({ ...response, unread: "the page had not received it whole" });
  });

  it("is unread when the page holds no copy of it", () => {
    expect(bodyFromPageCopy(response, undefined)).toEqual({
      ...response,
      unread: "no copy of it in the page",
    });
  });

  it("is the empty text when the page read an empty body whole", () => {
    expect(bodyFromPageCopy(response, copy({ text: "" }))).toEqual({
      ...response,
      text: "",
    });
  });

  it("is its whole text when the page read it whole", () => {
    expect(
      bodyFromPageCopy(response, copy({ text: '0:{"items":[]}' })),
    ).toEqual({ ...response, text: '0:{"items":[]}' });
  });
});
