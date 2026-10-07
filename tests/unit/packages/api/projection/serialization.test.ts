import { describe, expect, it } from "vitest";

import { fixture, policies } from "./fixtures";
import { resolveProjection } from "../../../../../packages/api/src/projection/index";

function project(value: unknown) {
  const x = fixture();
  return resolveProjection({
    ...x,
    row: { ...x.row, address: value },
    auth: {
      ...x.auth,
      ceiling: { ...x.auth.ceiling, readableFields: ["address"] },
    },
    policies: policies(x.surface, x.recordType, [{ fieldKey: "address" }]),
  });
}

describe("serialization of the validated supplied data graph", () => {
  it.each(["object", "array"])(
    "refuses a hidden own %s serializer without invoking it",
    (container) => {
      let executions = 0;
      const value = container === "object" ? { city: "London" } : ["benign"];
      Object.defineProperty(value, "toJSON", {
        enumerable: false,
        value: () => {
          executions++;
          return { private_identity: "WITHHELD", processor: "sk_private" };
        },
      });
      const result = project(value);
      expect({
        result,
        serialized: JSON.stringify(result),
        executions,
      }).toEqual({
        result: { kind: "refused" },
        serialized: '{"kind":"refused"}',
        executions: 0,
      });
    },
  );
  it.each(["object", "array"])(
    "refuses a hidden %s toJSON getter without invoking it",
    (container) => {
      let executions = 0;
      const value = container === "object" ? { city: "London" } : ["benign"];
      Object.defineProperty(value, "toJSON", {
        enumerable: false,
        get: () => {
          executions++;
          return () => "WITHHELD";
        },
      });
      const result = project(value);
      expect({
        result,
        serialized: JSON.stringify(result),
        executions,
      }).toEqual({
        result: { kind: "refused" },
        serialized: '{"kind":"refused"}',
        executions: 0,
      });
    },
  );
  it("refuses a hidden array-index accessor without reading it during validation or serialization", () => {
    let executions = 0;
    const value = ["benign"];
    Object.defineProperty(value, "0", {
      enumerable: false,
      get: () => {
        executions++;
        return "WITHHELD";
      },
    });
    const result = project(value);
    expect({ result, serialized: JSON.stringify(result), executions }).toEqual({
      result: { kind: "refused" },
      serialized: '{"kind":"refused"}',
      executions: 0,
    });
  });
  it("validates hidden descriptors recursively rather than just at the admitted whole field", () => {
    const nested = { city: "London" };
    Object.defineProperty(nested, "toJSON", {
      enumerable: false,
      value: () => "WITHHELD",
    });
    expect(project({ nested: [nested] })).toEqual({ kind: "refused" });
  });
  it.each(["hidden_fact", Symbol("hidden_fact")])(
    "refuses hidden executable/accessor descriptor %s outside named serializer hooks",
    (key) => {
      let executions = 0;
      const executable = { city: "London" };
      const accessor = { city: "London" };
      Object.defineProperty(executable, key, { value: () => "WITHHELD" });
      Object.defineProperty(accessor, key, {
        get: () => {
          executions++;
          return "WITHHELD";
        },
      });
      expect([project(executable), project(accessor), executions]).toEqual([
        { kind: "refused" },
        { kind: "refused" },
        0,
      ]);
    },
  );
  it("emits the validated graph even when the original container is later changed", () => {
    const value = { city: "London", names: ["Ada"] };
    const result = project(value);
    value.city = "changed";
    value.names[0] = "WITHHELD";
    Object.defineProperty(value, "toJSON", {
      value: () => ({ processor: "sk_private" }),
    });
    expect(JSON.stringify(result)).toBe(
      '{"kind":"allowed","projection":{"address":{"city":"London","names":["Ada"]}}}',
    );
  });
  it("preserves hidden plain array indices and sparse length without fabricating supplied values", () => {
    const value: unknown[] = [null, false, 0];
    Object.defineProperty(value, "1", { value: false, enumerable: false });
    value.length = 5;
    const result = project(value);
    expect(JSON.stringify(result)).toBe(
      '{"kind":"allowed","projection":{"address":[null,false,0,null,null]}}',
    );
    if (result.kind !== "allowed")
      throw new Error("Expected qualified plain data");
    const supplied = result.projection.address as unknown[];
    expect({
      length: supplied.length,
      hasHole: Object.hasOwn(supplied, "3"),
      hiddenIndex: Object.getOwnPropertyDescriptor(supplied, "1")?.enumerable,
    }).toEqual({ length: 5, hasHole: false, hiddenIndex: false });
  });
  it("preserves ordinary nested object/array/null/false/zero values and their serialization", () => {
    const value = {
      city: "London",
      items: [null, false, 0, "", { named: "Ada" }],
    };
    const result = project(value);
    expect(result).toEqual({ kind: "allowed", projection: { address: value } });
    expect(JSON.stringify(result)).toBe(
      '{"kind":"allowed","projection":{"address":{"city":"London","items":[null,false,0,"",{"named":"Ada"}]}}}',
    );
  });
});
