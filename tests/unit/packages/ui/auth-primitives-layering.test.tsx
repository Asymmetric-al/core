/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  AuthCard,
  AuthCardContent,
  AuthCardHeader,
} from "../../../../packages/ui/components/auth/auth-primitives";

afterEach(() => {
  cleanup();
});

describe("auth card primitives", () => {
  it("keeps header and content above decorative card layers", () => {
    render(
      <AuthCard>
        <div className="pointer-events-none absolute -bottom-28 -left-20 size-56 rounded-full bg-muted/40" />
        <AuthCardHeader>Header</AuthCardHeader>
        <AuthCardContent>Content</AuthCardContent>
      </AuthCard>,
    );

    expect(Array.from(screen.getByText("Header").classList)).toEqual(
      expect.arrayContaining(["relative", "z-10"]),
    );
    expect(Array.from(screen.getByText("Content").classList)).toEqual(
      expect.arrayContaining(["relative", "z-10"]),
    );
  });
});
