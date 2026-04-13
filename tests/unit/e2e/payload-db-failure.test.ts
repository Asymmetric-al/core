import { describe, expect, it } from "vitest";

import {
  PAYLOAD_DB_FAILURE_MARKERS,
  textMatchesPayloadDbFailure,
} from "../../e2e/lib/payload-db-failure";

describe("textMatchesPayloadDbFailure", () => {
  it("matches each documented marker substring", () => {
    for (const marker of PAYLOAD_DB_FAILURE_MARKERS) {
      expect(textMatchesPayloadDbFailure(`prefix ${marker} suffix`)).toBe(true);
    }
  });

  it("is case-sensitive for mixed-case markers", () => {
    expect(textMatchesPayloadDbFailure("cannot connect to Postgres")).toBe(
      true,
    );
    expect(textMatchesPayloadDbFailure("CANNOT CONNECT TO POSTGRES")).toBe(
      false,
    );
  });

  it("returns false for unrelated errors and empty input", () => {
    expect(textMatchesPayloadDbFailure("TypeError: oops")).toBe(false);
    expect(textMatchesPayloadDbFailure("")).toBe(false);
  });

  it("matches when markers appear in HTML-ish payloads", () => {
    const html = `<script>self.__next_f.push([1,"payloadInitError:true"])</script>`;
    expect(textMatchesPayloadDbFailure(html)).toBe(true);
  });
});
