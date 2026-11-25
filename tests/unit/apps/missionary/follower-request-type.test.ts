import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

const FEED = fileURLToPath(
  new URL("../../../../apps/missionary/app/feed/", import.meta.url),
);
const PROBE = path.join(FEED, "follower-request-probe.ts");

function probe(donorId: string): string[] {
  const source = `import type { FollowerRequest } from "./feed-model";
export const request: FollowerRequest = {
  id: "request-1",
  donor_id: ${donorId},
  name: "Anonymous partner",
  avatar_url: null,
  is_donor: true,
  access_level: "view",
  status: "pending",
  created_at: "2026-11-25T00:00:00.000Z",
  initials: "AP",
};
`;
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    types: [],
  };
  const isProbe = (fileName: string) =>
    path.resolve(fileName) === path.resolve(PROBE);
  const host = ts.createCompilerHost(options);
  const readSource = host.getSourceFile.bind(host);
  const exists = host.fileExists.bind(host);
  host.getSourceFile = (fileName, languageVersion, ...rest) =>
    isProbe(fileName)
      ? ts.createSourceFile(fileName, source, languageVersion, true)
      : readSource(fileName, languageVersion, ...rest);
  host.fileExists = (fileName) => isProbe(fileName) || exists(fileName);
  const program = ts.createProgram([PROBE], options, host);
  const file = program.getSourceFile(PROBE)!;
  return [
    ...program.getSyntacticDiagnostics(file),
    ...program.getSemanticDiagnostics(file),
  ].map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
}

describe("AL-2678 WP5 part 2-r2s, ruling Q3: a hidden follow request carries no donor id, and the missionary app's type says so", () => {
  it("a request whose donor_id is null, as the follower-request routes answer for a hidden requester, is a FollowerRequest", () => {
    expect(probe("null")).toEqual([]);
  });

  it("a request whose donor_id is a string is one too (guard)", () => {
    expect(probe('"donor-1"')).toEqual([]);
  });

  it("the compiler still refuses a donor_id of another type (control)", () => {
    expect(probe("42").join("\n")).toMatch(/not assignable to type/);
  });
});
