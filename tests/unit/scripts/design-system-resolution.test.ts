import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import parser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import { afterAll, describe, expect, it } from "vitest";

import { designSystemConfig } from "../../../tooling/eslint-config/design-system.mjs";

const root = process.cwd();
const workspaces = [
  "apps/admin",
  "apps/donor",
  "apps/missionary",
  "packages/ui",
  "packages/missionary",
];
const linters = new Map<string, ESLint>();
function actualLinter(workspace?: string) {
  const cwd = workspace ? path.join(root, workspace) : root;
  let eslint = linters.get(cwd);
  if (!eslint) {
    eslint = new ESLint({
      cwd,
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    linters.set(cwd, eslint);
  }
  return eslint;
}
function consumerPath(workspace: string) {
  return path.join(
    root,
    workspace,
    workspace.startsWith("apps/")
      ? "app/design-system-resolution-probe.tsx"
      : "components/consumer/design-system-resolution-probe.tsx",
  );
}
function messagesFor(result: ESLint.LintResult, rule = "shadcn/no-restyle") {
  return result.messages.filter((message) => message.ruleId === rule);
}

const fixture = mkdtempSync(
  path.join(os.tmpdir(), "core-design-system-resolution-"),
);
function write(relative: string, source: string) {
  const filename = path.join(fixture, relative);
  mkdirSync(path.dirname(filename), { recursive: true });
  writeFileSync(filename, source);
  return filename;
}
function copy(relative: string) {
  const target = path.join(fixture, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(path.join(root, relative), target, { recursive: true });
}
for (const relative of [
  "package.json",
  "apps/donor/package.json",
  "apps/donor/tsconfig.json",
  "apps/donor/app/globals.css",
  "packages/ui/package.json",
  "packages/ui/tsconfig.json",
  "packages/ui/components.json",
  "packages/ui/index.ts",
  "packages/ui/components/shadcn/index.ts",
  "packages/ui/components/shadcn/button.tsx",
  "packages/ui/components/shadcn/card.tsx",
  "packages/ui/components/shadcn/tooltip.tsx",
  "packages/ui/components/shadcn/dialog.tsx",
  "packages/ui/lib/utils.ts",
  "packages/ui/styles/globals.css",
])
  copy(relative);
function linkPackage(name: string, target: string) {
  const destination = path.join(fixture, "node_modules", name);
  mkdirSync(path.dirname(destination), { recursive: true });
  symlinkSync(target, destination, "junction");
}
linkPackage("@asym/ui", path.join(fixture, "packages/ui"));
for (const name of [
  "tailwindcss",
  "tw-animate-css",
  "@tailwindcss/typography",
  "@react-email/editor",
  "@base-ui/react",
  "@asym/typescript-config",
]) {
  const candidate = [
    path.join(root, "node_modules", name),
    path.join(root, "packages/ui/node_modules", name),
  ].find(existsSync);
  if (!candidate)
    throw new Error(
      `Cannot construct the installed Core fixture: ${name} is missing`,
    );
  linkPackage(name, realpathSync(candidate));
}
write(
  "apps/donor/components/ordinary.tsx",
  "export function Button({ className }: { className?: string }) { return <button className={className} />; }",
);
write(
  "apps/donor/components/forwarded.tsx",
  'import { Button } from "@asym/ui/components/shadcn/button"; export function Forwarded({ className, ...props }) { return <Button className={className} {...props} />; }',
);
write(
  "apps/donor/components/reexport.ts",
  'export { Button as Action } from "@asym/ui/components/shadcn/button"; export { Button as Ordinary } from "./ordinary";',
);
write(
  "apps/donor/components/commented-reexport.ts",
  `export {
    /* Shared control */ Button as Action,
    // Another public name for the same control.
    Button as SecondaryAction,
  } from "@asym/ui/components/shadcn/button";
  export { /* Unrelated component */ Button as Ordinary } from "./ordinary";
  export { /* Content typography */ CardTitle as Heading } from "@asym/ui/components/shadcn/card";`,
);
const fixtureLinter = new ESLint({
  cwd: fixture,
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ["**/*.tsx"],
      languageOptions: {
        parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
    },
    ...designSystemConfig({ rootDir: fixture }),
  ],
});
afterAll(() => rmSync(fixture, { recursive: true, force: true }));
let sequence = 0;
async function lintFixture(source: string, workspace = "apps/donor") {
  const filename = write(
    `${workspace}/components/consumer/probe-${sequence++}.tsx`,
    source,
  );
  return (await fixtureLinter.lintFiles([filename]))[0];
}

describe("Core component resolution through actual ESLint configurations", () => {
  it.each(workspaces)(
    "protects deep, barrel and renamed imports equally from root and %s",
    async (workspace) => {
      for (const specifier of [
        "@asym/ui/components/shadcn/button",
        "@asym/ui/components/shadcn",
        "@asym/ui",
      ]) {
        const source = `import { Button as Action } from "${specifier}"; export const Probe = () => <Action className="p-8" />;`;
        const filePath = consumerPath(workspace);
        const [local] = await actualLinter(workspace).lintText(source, {
          filePath,
        });
        const [fromRoot] = await actualLinter().lintText(source, { filePath });
        expect(messagesFor(local), `${workspace}: ${specifier}`).toHaveLength(
          1,
        );
        const decision = ({
          ruleId,
          messageId,
          severity,
          line,
          column,
        }: ESLint.LintResult["messages"][number]) => ({
          ruleId,
          messageId,
          severity,
          line,
          column,
        });
        expect(messagesFor(fromRoot).map(decision)).toEqual(
          messagesFor(local).map(decision),
        );
        expect(messagesFor(local)[0].message).toContain("icon-xs");
      }
    },
  );

  it("does not label unrelated root auth exports as canonical shadcn primitives", async () => {
    const eslint = actualLinter("apps/donor");
    const filePath = consumerPath("apps/donor");
    const [auth] = await eslint.lintText(
      'import { AuthCardHeader } from "@asym/ui"; export const Probe = () => <AuthCardHeader className="p-4 bg-primary"/>;',
      { filePath },
    );
    expect(
      auth.messages.filter((message) => message.ruleId?.startsWith("shadcn/")),
    ).toEqual([]);
    const [invalid] = await eslint.lintText(
      'import { AuthCardHeader } from "@asym/ui"; export const Probe = () => <AuthCardHeader className="bg-zinc-500 p-[13px] hovr:flex" style={{width:13}}/>;',
      { filePath },
    );
    expect(messagesFor(invalid)).toEqual([]);
    expect(
      invalid.messages
        .filter((message) => message.ruleId?.startsWith("shadcn/"))
        .map((message) => message.ruleId)
        .sort(),
    ).toEqual([
      "shadcn/no-arbitrary-values",
      "shadcn/no-inline-styles",
      "shadcn/no-raw-colors",
      "shadcn/no-unknown-classes",
    ]);
  });

  it("allows the actual Button authoring focus, press and CVA implementation", async () => {
    const [result] = await actualLinter("packages/ui").lintFiles([
      path.join(root, "packages/ui/components/shadcn/button.tsx"),
    ]);
    expect(
      result.messages.filter((message) =>
        message.ruleId?.startsWith("shadcn/"),
      ),
    ).toEqual([]);
  });

  it("recognizes the real internal UI alias", async () => {
    const result = await lintFixture(
      'import { Button as Action } from "@/components/shadcn/button"; export const Probe = () => <Action className="p-8" />;',
      "packages/ui",
    );
    expect(messagesFor(result)).toHaveLength(1);
    expect(messagesFor(result)[0].message).toContain("<Button>");
  });

  it("follows shared bindings through a mixed physical barrel and className forwarding", async () => {
    const result = await lintFixture(
      'import { Forwarded } from "../forwarded"; import { Action, Ordinary } from "../reexport"; export const Probe = () => <><Forwarded className="p-8"/><Action className="p-8"/><Ordinary className="p-8"/></>;',
    );
    expect(messagesFor(result)).toHaveLength(2);
    expect(
      messagesFor(result).every((message) =>
        message.message.includes("icon-xs"),
      ),
    ).toBe(true);
    expect(messagesFor(result)[0].message).toContain(
      "forwards className to <Button>",
    );
  });

  it("does not identify an unrelated component by its familiar Button name", async () => {
    const result = await lintFixture(
      'import { Button } from "../ordinary"; export const Probe = () => <Button className="bg-primary p-8" />;',
    );
    expect(messagesFor(result)).toEqual([]);
  });

  it("retains component ownership through commented barrel export lists", async () => {
    const result = await lintFixture(
      'import { Action, SecondaryAction, Ordinary, Heading } from "../commented-reexport"; export const Probe = () => <><Action className="p-8"/><SecondaryAction className="p-8"/><Ordinary className="p-8"/><Heading className="text-xl"/></>;',
    );
    expect(messagesFor(result)).toHaveLength(2);
    expect(
      messagesFor(result).every(
        (message) =>
          message.message.includes("<Button>") &&
          message.message.includes("icon-xs"),
      ),
    ).toBe(true);
  });

  it("allows Core variants and compact sizes without consumer restyling", async () => {
    const result = await lintFixture(
      'import { Button } from "@asym/ui/components/shadcn/button"; export const Probe = () => <><Button variant="outline" size="xs"/><Button variant="maia" size="icon-xs" className="mt-4"/><Button variant="ghost" size="icon-sm"/></>;',
    );
    expect(result.messages).toEqual([]);
  });

  it("keeps owned control dimensions, focus and press behavior protected", async () => {
    for (const className of [
      "h-12",
      "size-12",
      "focus-visible:ring-0",
      "active:scale-95",
      "hover:translate-y-1",
    ]) {
      const result = await lintFixture(
        `import { Button } from "@asym/ui/components/shadcn/button"; export const Probe = () => <Button className="${className}"/>;`,
      );
      expect(messagesFor(result), className).toHaveLength(1);
    }
  });

  it("accepts complete conditionals, constants, cn and received className/style", async () => {
    const result = await lintFixture(
      'import { Button } from "@asym/ui/components/shadcn/button"; import { cn } from "@asym/ui/lib/utils"; const placement="mt-4"; export function Forwarded({wide,className,style,...props}){return <Button className={cn(placement,wide ? "w-full" : "max-w-full",className)} style={style} {...props}/>;}',
    );
    expect(result.messages).toEqual([]);
  });

  it("checks CVA definitions without pretending a produced variant function is a merge helper", async () => {
    const valid = await lintFixture(
      'import { cva } from "class-variance-authority"; import { buttonVariants } from "@asym/ui/components/shadcn/button"; const variants=cva("bg-primary",{variants:{tone:{muted:"text-muted-foreground"}}}); export const Probe=()=> <a className={buttonVariants({variant:"link"})}>Read</a>;',
    );
    expect(valid.messages).toEqual([]);
    const invalid = await lintFixture(
      'import { cva } from "class-variance-authority"; const variants=cva("bg-zinc-500"); export const Probe=()=> <div/>;',
    );
    expect(messagesFor(invalid, "shadcn/no-raw-colors")).toHaveLength(1);
    const opaque = await lintFixture(
      'import { Button,buttonVariants } from "@asym/ui/components/shadcn/button"; export const Probe=()=> <Button className={buttonVariants({variant:"outline"})}/>;',
    );
    expect(messagesFor(opaque, "shadcn/require-static-classes")).toHaveLength(
      1,
    );
  });

  it("checks safe Base UI composition on the rendered component", async () => {
    const valid = await lintFixture(
      'import { Button } from "@asym/ui/components/shadcn/button"; import { DialogTrigger } from "@asym/ui/components/shadcn/dialog"; export const Probe=()=> <DialogTrigger render={<Button variant="outline" size="icon-xs"/>}/>;',
    );
    expect(valid.messages).toEqual([]);
    const invalid = await lintFixture(
      'import { Button } from "@asym/ui/components/shadcn/button"; import { DialogTrigger } from "@asym/ui/components/shadcn/dialog"; export const Probe=()=> <DialogTrigger render={<Button className="p-8"/>}/>;',
    );
    expect(messagesFor(invalid)).toHaveLength(1);
    expect(messagesFor(invalid)[0].message).toContain("<Button>");
  });

  it("attributes caller classes to the actual Base UI rendered Button", async () => {
    // The trigger forwards these classes to Button. Diagnostics must name its
    // real owner and size API, rather than suggesting a new trigger contract.
    const result = await lintFixture(
      'import { Button } from "@asym/ui/components/shadcn/button"; import { DialogTrigger } from "@asym/ui/components/shadcn/dialog"; export const Probe=()=> <DialogTrigger render={<Button/>} className="p-8"/>;',
    );
    expect(messagesFor(result)).toHaveLength(1);
    expect(messagesFor(result)[0].message).toContain("<Button>");
    expect(messagesFor(result)[0].message).toContain("icon-xs");
  });

  it("retains trigger protection when the render target is opaque", async () => {
    const result = await lintFixture(
      'import { DialogTrigger } from "@asym/ui/components/shadcn/dialog"; export function Probe({renderTarget}) { return <DialogTrigger render={renderTarget} className="p-8"/>; }',
    );
    expect(messagesFor(result)).toHaveLength(1);
    expect(messagesFor(result)[0].message).toContain("<DialogTrigger>");
  });
});
