import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@asym/database/own-api", () => ({ ownApiFetch: h.fetch }));

import {
  addPartner,
  AddPartnerRefused,
} from "../../../../packages/missionary/components/add-partner-api";

const KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ADDED = { donorId: "d-1", partyId: "p-1", duplicate: false };

let serial = 0;
function values() {
  serial += 1;
  return {
    name: `Key Partner ${serial}`,
    phone: "",
    type: "Individual" as const,
    frequency: "Monthly" as const,
    location: "Kampala",
  };
}

function answer(status: number, body: unknown = ADDED) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function keyOf(call: number) {
  const init = h.fetch.mock.calls[call]![1] as RequestInit;
  return new Headers(init.headers).get("Idempotency-Key");
}

describe("the Add Partner submission key in the browser (AL-2678 WP5 rest, fix round F1 rule 6 and F12)", () => {
  beforeEach(() => {
    h.fetch.mockReset();
  });

  it.each([200, 201])(
    "drops the key after a %i: the next press with the same details is a new submission",
    async (status) => {
      const partner = values();
      h.fetch.mockResolvedValueOnce(answer(status));
      h.fetch.mockResolvedValueOnce(answer(201));
      await addPartner(partner);
      await addPartner(partner);
      expect(keyOf(0)).toMatch(KEY);
      expect(keyOf(1)).not.toBe(keyOf(0));
    },
  );

  it.each([400, 403, 409])(
    "drops the key after a %i, which wrote nothing (red: the key is kept)",
    async (status) => {
      const partner = values();
      h.fetch.mockResolvedValueOnce(answer(status, { error: "refused" }));
      h.fetch.mockResolvedValueOnce(answer(201));
      await expect(addPartner(partner)).rejects.toBeInstanceOf(
        AddPartnerRefused,
      );
      await addPartner(partner);
      expect(keyOf(1)).not.toBe(keyOf(0));
    },
  );

  it.each([500, 502])(
    "keeps the key after a %i: the retry is the same submission",
    async (status) => {
      const partner = values();
      h.fetch.mockResolvedValueOnce(answer(status, { error: "failed" }));
      h.fetch.mockResolvedValueOnce(answer(200, { ...ADDED, duplicate: true }));
      await expect(addPartner(partner)).rejects.toBeInstanceOf(
        AddPartnerRefused,
      );
      await addPartner(partner);
      expect(keyOf(1)).toBe(keyOf(0));
    },
  );

  it("keeps the key after a network failure", async () => {
    const partner = values();
    h.fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    h.fetch.mockResolvedValueOnce(answer(200, { ...ADDED, duplicate: true }));
    await expect(addPartner(partner)).rejects.toBeInstanceOf(TypeError);
    await addPartner(partner);
    expect(keyOf(1)).toBe(keyOf(0));
  });

  it("two submissions of one intent at once share one request, and its answer (F12; red: two requests, the second's answer able to make a second partner)", async () => {
    const partner = values();
    let release!: (response: Response) => void;
    h.fetch.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        }),
    );
    const first = addPartner(partner);
    const second = addPartner({ ...partner, name: ` ${partner.name}  ` });
    release(answer(201));
    await expect(first).resolves.toEqual(ADDED);
    await expect(second).resolves.toEqual(ADDED);
    expect(h.fetch).toHaveBeenCalledTimes(1);
  });

  it("two submissions of one intent at once whose shared answer is lost both fail, and the retry keeps the key (F12)", async () => {
    const partner = values();
    let lose!: (error: Error) => void;
    h.fetch.mockImplementationOnce(
      () =>
        new Promise<Response>((_resolve, reject) => {
          lose = reject;
        }),
    );
    h.fetch.mockResolvedValueOnce(answer(200, { ...ADDED, duplicate: true }));
    const first = addPartner(partner);
    const second = addPartner(partner);
    lose(new TypeError("Failed to fetch"));
    await expect(first).rejects.toBeInstanceOf(TypeError);
    await expect(second).rejects.toBeInstanceOf(TypeError);
    await addPartner(partner);
    expect(h.fetch).toHaveBeenCalledTimes(2);
    expect(keyOf(1)).toBe(keyOf(0));
  });
});
