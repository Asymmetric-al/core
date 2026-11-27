import { describe, expect, it, vi } from "vitest";

import { refuseRestoreUnderLock } from "../../../apps/admin/src/cms/tenancy/page-rules";

const ME = "00000000-0000-4000-8000-0000000000a1";
const OTHER = "00000000-0000-4000-8000-0000000000b2";
const PAGE = "5c4b3a29-1807-4f6e-9d5c-4b3a29180716";
const VERSION = "9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a";

type Lock = { user: { value: unknown }; updatedAt: string };

function makeReq({
  locks = [] as Lock[],
  lockDocuments = undefined as unknown,
  versionMissing = false,
} = {}) {
  const find = vi.fn(async () => ({ docs: locks }));
  const findVersionByID = vi.fn(async () => {
    if (versionMissing)
      throw Object.assign(new Error("Not Found"), { status: 404 });
    return { id: VERSION, parent: PAGE };
  });
  const req = {
    user: { id: ME, collection: "principal-links" },
    context: {},
    payload: {
      collections: { pages: { config: { lockDocuments } } },
      find,
      findVersionByID,
    },
  };
  return { req, find, findVersionByID };
}

const secondsAgo = (seconds: number) =>
  new Date(Date.now() - seconds * 1000).toISOString();

async function restore(req: unknown, operation = "restoreVersion") {
  return refuseRestoreUnderLock({
    args: { id: VERSION, draft: true },
    collection: { slug: "pages" },
    context: {},
    operation,
    req,
  } as never);
}

describe("a restore over another person's lock is refused (WP6 rest, pull request 2, invariant 7; #2809 F4)", () => {
  it("refuses while another person holds an unexpired lock on the page the version belongs to", async () => {
    const { req, find, findVersionByID } = makeReq({
      locks: [{ user: { value: OTHER }, updatedAt: secondsAgo(10) }],
    });
    await expect(restore(req)).rejects.toMatchObject({ status: 423 });
    expect(findVersionByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "pages",
        id: VERSION,
        overrideAccess: false,
        req,
      }),
    );
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "payload-locked-documents",
        overrideAccess: false,
        req,
        where: {
          and: [
            { "document.relationTo": { equals: "pages" } },
            { "document.value": { equals: PAGE } },
          ],
        },
      }),
    );
  });

  it("refuses a lock whose holder arrives populated", async () => {
    const { req } = makeReq({
      locks: [{ user: { value: { id: OTHER } }, updatedAt: secondsAgo(10) }],
    });
    await expect(restore(req)).rejects.toMatchObject({ status: 423 });
  });

  it("lets the holder restore", async () => {
    const { req } = makeReq({
      locks: [{ user: { value: ME }, updatedAt: secondsAgo(10) }],
    });
    await expect(restore(req)).resolves.toMatchObject({ id: VERSION });
  });

  it("lets anyone restore once the lock has expired, at the collection's own duration", async () => {
    const stale = [{ user: { value: OTHER }, updatedAt: secondsAgo(360) }];
    await expect(restore(makeReq({ locks: stale }).req)).resolves.toMatchObject(
      { id: VERSION },
    );
    await expect(
      restore(makeReq({ locks: stale, lockDocuments: { duration: 900 } }).req),
    ).rejects.toMatchObject({ status: 423 });
  });

  it("passes with no lock, leaves a missing version to the restore's own answer, and reads nothing for another operation", async () => {
    await expect(restore(makeReq().req)).resolves.toMatchObject({
      id: VERSION,
    });
    await expect(
      restore(makeReq({ versionMissing: true }).req),
    ).resolves.toMatchObject({ id: VERSION });
    const { req, find, findVersionByID } = makeReq({
      locks: [{ user: { value: OTHER }, updatedAt: secondsAgo(10) }],
    });
    await expect(restore(req, "update")).resolves.toMatchObject({
      id: VERSION,
    });
    expect(find).not.toHaveBeenCalled();
    expect(findVersionByID).not.toHaveBeenCalled();
  });
});
