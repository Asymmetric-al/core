/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import {
  useLogCareActivity,
  useMemberCareDashboardQuery,
  useMemberCareDetailQuery,
  type MemberCareActivity,
  type MemberCarePersonnel,
} from "../../../../packages/database/hooks/member-care";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

beforeEach(() => {
  getQueryClient().clear();
  getQueryClient().setDefaultOptions({ queries: { retry: false } });
});

afterEach(() => {
  cleanup();
  getQueryClient().clear();
  vi.unstubAllGlobals();
});

it("treats a real 404 as a successful missing profile without retrying", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 404 }));
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderHook(() => useMemberCareDetailQuery("missing"), {
    wrapper: Wrapper,
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({
    personnel: null,
    activities: [],
    privateNotes: [],
    goals: [],
    requirements: [],
  });
  expect(fetchMock).toHaveBeenCalledOnce();
});

it.each([403, 500])(
  "keeps HTTP %i unavailable instead of returning empty history",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: "Care unavailable" }, { status }),
        ),
    );
    const { result } = renderHook(() => useMemberCareDetailQuery("member"), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error?.message).toBe("Care unavailable");
  },
);

it("refreshes the profile, overview and last contact after logging contact", async () => {
  const contact: MemberCareActivity = {
    id: "contact-1",
    kind: "activity",
    personnelId: "member",
    type: "Check-in",
    content: "We discussed next steps.",
    date: "2026-11-11T09:00:00.000Z",
    authorId: "staff",
    authorName: "Staff",
    isPrivate: false,
  };
  const person: MemberCarePersonnel = {
    id: "member",
    name: "Grace Mwangi",
    nameMissing: false,
    initials: "GM",
    location: "Nairobi",
    timezone: "Africa/Nairobi",
    status: "Healthy",
    lastCheckIn: null,
    role: "Field nurse",
    region: "Africa",
    healthSignals: {
      emotional: null,
      spiritual: null,
      physical: null,
      financial: null,
    },
    careGaps: [],
  };
  let saved = false;
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      if (
        input === "/api/admin/member-care/activity" &&
        init?.method === "POST"
      ) {
        saved = true;
        return Response.json({ id: contact.id });
      }
      const activities = saved ? [contact] : [];
      const personnel = { ...person, lastCheckIn: saved ? contact.date : null };
      if (input === "/api/admin/member-care/dashboard") {
        return Response.json({
          personnel: [personnel],
          personnelTotal: 1,
          activities,
          goals: [],
          requirements: [],
          lastContacts: saved ? { member: { "Check-in": contact.date } } : {},
        });
      }
      if (input === "/api/admin/member-care/directory/member") {
        return Response.json({
          personnel,
          activities,
          privateNotes: [],
          goals: [],
          requirements: [],
        });
      }
      throw new Error(`Unexpected request: ${input}`);
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderHook(
    () => ({
      detail: useMemberCareDetailQuery("member"),
      dashboard: useMemberCareDashboardQuery(),
      log: useLogCareActivity(),
    }),
    { wrapper: Wrapper },
  );
  await waitFor(() =>
    expect(
      result.current.detail.isSuccess && result.current.dashboard.isSuccess,
    ).toBe(true),
  );
  expect(result.current.detail.data?.personnel?.lastCheckIn).toBeNull();
  await act(async () => {
    await result.current.log.mutateAsync({
      personnelId: "member",
      type: "Check-in",
      content: contact.content,
    });
  });
  await waitFor(() => {
    expect(result.current.detail.data?.activities).toEqual([contact]);
    expect(result.current.detail.data?.personnel?.lastCheckIn).toBe(
      contact.date,
    );
    expect(result.current.dashboard.data?.activities).toEqual([contact]);
    expect(
      result.current.dashboard.data?.lastContacts.member?.["Check-in"],
    ).toBe(contact.date);
  });
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/admin/member-care/activity",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        personnelId: "member",
        type: "Check-in",
        content: contact.content,
      }),
    }),
  );
});
