// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteMediaFile,
  mediaAddress,
  registerUploadedMedia,
  uploadMediaFile,
} from "../../../../apps/admin/src/cms-ui/web-studio/media/media-upload";

const own = vi.hoisted(() => ({ fetch: vi.fn() }));

vi.mock("@asym/database/own-api", () => ({ ownApiFetch: own.fetch }));

const ASSET = "6b3b7f6e-9f0a-4c1d-8e2f-3a4b5c6d7e8f";
const SIGNED =
  "https://project.supabase.co/storage/v1/object/upload/sign/cms-media/tmp/t/a?token=tok";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const documentFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  own.fetch.mockReset();
  documentFetch.mockReset();
  vi.stubGlobal("fetch", documentFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const photo = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], "well.jpg", {
    type: "image/jpeg",
  });

const details = { alt: "A new well", credit: "Field team", folder: null };

function happyPath() {
  own.fetch.mockImplementation(async (path: string) => {
    if (path === "/api/cms/media/start") {
      return json(201, { assetId: ASSET, signedUrl: SIGNED, token: "tok" });
    }
    if (path === "/api/cms/media/finalize") {
      return json(200, { asset: { id: ASSET, status: "ready" } });
    }
    throw new Error(`unexpected own API call ${path}`);
  });
  documentFetch.mockImplementation(async (input) => {
    const address = String(input);
    if (address === SIGNED) return new Response(null, { status: 200 });
    if (address === "/web-studio/api/web-studio/media/register") {
      return json(200, { id: ASSET });
    }
    throw new Error(`unexpected document call ${address}`);
  });
}

describe("the media library's upload adapter (WP6 rest, pull request 2, invariants 1 to 3)", () => {
  it("starts and finalizes through ownApiFetch, puts the bytes straight to Storage's signed address, and registers through the document's own fetch", async () => {
    happyPath();
    const file = photo();
    await expect(uploadMediaFile(file, details)).resolves.toEqual({
      ok: true,
      id: ASSET,
    });

    expect(own.fetch.mock.calls.map(([path]) => path)).toEqual([
      "/api/cms/media/start",
      "/api/cms/media/finalize",
    ]);
    expect(JSON.parse(String(own.fetch.mock.calls[0]![1].body))).toEqual({
      byteSize: 4,
      mimeType: "image/jpeg",
    });
    expect(JSON.parse(String(own.fetch.mock.calls[1]![1].body))).toEqual({
      assetId: ASSET,
    });

    const [upload, register] = documentFetch.mock.calls;
    expect(upload![0]).toBe(SIGNED);
    expect(upload![1]).toMatchObject({ method: "PUT", body: file });
    expect(new Headers(upload![1]!.headers).get("content-type")).toBe(
      "image/jpeg",
    );
    expect(register![0]).toBe("/web-studio/api/web-studio/media/register");
    expect(register![1]).toMatchObject({
      method: "POST",
      credentials: "same-origin",
    });
    expect(JSON.parse(String(register![1]!.body))).toEqual({
      assetId: ASSET,
      alt: "A new well",
      credit: "Field team",
      folder: null,
    });
    for (const [address] of documentFetch.mock.calls) {
      expect(String(address)).not.toMatch(/^\/api\//);
    }
  });

  it("uses the document's fetch as it is when the call is made, so Web Studio's wrapper adds the organization's claims", async () => {
    happyPath();
    const wrapped = vi.fn<typeof fetch>(async (input, init) =>
      documentFetch(input, init),
    );
    vi.stubGlobal("fetch", wrapped);
    await uploadMediaFile(photo(), details);
    expect(wrapped.mock.calls.map(([address]) => String(address))).toContain(
      "/web-studio/api/web-studio/media/register",
    );
  });

  it("shows a start refusal and goes no further: no bytes, no finalize, no record", async () => {
    own.fetch.mockResolvedValueOnce(
      json(400, {
        error: "byteSize: Too big: expected number to be <=15728640",
      }),
    );
    const outcome = await uploadMediaFile(photo(), details);
    expect(outcome).toMatchObject({ ok: false, stage: "start" });
    expect(own.fetch).toHaveBeenCalledTimes(1);
    expect(documentFetch).not.toHaveBeenCalled();
  });

  it("refuses a file over the byte limit or of another type before any call", async () => {
    const big = new File([new Uint8Array(15_728_641)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(await uploadMediaFile(big, details)).toMatchObject({
      ok: false,
      stage: "start",
      message: expect.stringMatching(/15 MB/),
    });
    const gif = new File([new Uint8Array([1])], "x.gif", { type: "image/gif" });
    expect(await uploadMediaFile(gif, details)).toMatchObject({
      ok: false,
      stage: "start",
      message: expect.stringMatching(/JPEG, PNG or WebP/),
    });
    expect(own.fetch).not.toHaveBeenCalled();
    expect(documentFetch).not.toHaveBeenCalled();
  });

  it("stops when Storage refuses the bytes", async () => {
    happyPath();
    documentFetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
    expect(await uploadMediaFile(photo(), details)).toMatchObject({
      ok: false,
      stage: "upload",
    });
    expect(own.fetch.mock.calls.map(([path]) => path)).toEqual([
      "/api/cms/media/start",
    ]);
  });

  it("shows finalize's refusal (an image over the pixel limit) and makes no record", async () => {
    happyPath();
    own.fetch.mockImplementation(async (path: string) =>
      path === "/api/cms/media/start"
        ? json(201, { assetId: ASSET, signedUrl: SIGNED, token: "tok" })
        : json(422, { error: "Image exceeds 25 megapixel limit" }),
    );
    expect(await uploadMediaFile(photo(), details)).toEqual({
      ok: false,
      stage: "finalize",
      assetId: ASSET,
      message: "Image exceeds 25 megapixel limit",
    });
    expect(documentFetch.mock.calls.map(([address]) => address)).toEqual([
      SIGNED,
    ]);
  });

  it("keeps the asset when registration fails, and a retry only registers again", async () => {
    happyPath();
    documentFetch.mockImplementation(async (input) =>
      String(input) === SIGNED
        ? new Response(null, { status: 200 })
        : json(500, { errors: [{ message: "Something went wrong." }] }),
    );
    expect(await uploadMediaFile(photo(), details)).toMatchObject({
      ok: false,
      stage: "register",
      assetId: ASSET,
    });
    own.fetch.mockClear();
    documentFetch.mockReset();
    documentFetch.mockResolvedValueOnce(json(200, { id: ASSET }));
    await expect(registerUploadedMedia(ASSET, details)).resolves.toEqual({
      ok: true,
      id: ASSET,
    });
    expect(own.fetch).not.toHaveBeenCalled();
    expect(documentFetch.mock.calls.map(([address]) => address)).toEqual([
      "/web-studio/api/web-studio/media/register",
    ]);
  });
});

describe("the media library's delete (WP6 rest, pull request 2, invariant 4)", () => {
  it("deletes the stored file on the caller's token, then removes the record through the document's fetch", async () => {
    own.fetch.mockResolvedValueOnce(
      json(200, { assetId: ASSET, status: "deleted" }),
    );
    documentFetch.mockResolvedValueOnce(json(200, { id: ASSET }));
    await expect(deleteMediaFile(ASSET)).resolves.toEqual({ ok: true });
    expect(own.fetch).toHaveBeenCalledWith(
      "/api/cms/media/delete",
      expect.objectContaining({ method: "POST" }),
    );
    expect(documentFetch.mock.calls[0]![0]).toBe(
      "/web-studio/api/web-studio/media/remove",
    );
  });

  it("removes the record of a file that was never stored (the fixtures' media)", async () => {
    own.fetch.mockResolvedValueOnce(
      json(404, { error: "Media asset not found" }),
    );
    documentFetch.mockResolvedValueOnce(json(200, { id: ASSET }));
    await expect(deleteMediaFile(ASSET)).resolves.toEqual({ ok: true });
  });

  it("stops, removing nothing, when the file's delete is refused, and says so when the record's removal fails", async () => {
    own.fetch.mockResolvedValueOnce(json(403, { error: "Forbidden" }));
    expect(await deleteMediaFile(ASSET)).toMatchObject({ ok: false });
    expect(documentFetch).not.toHaveBeenCalled();
    own.fetch.mockResolvedValueOnce(json(200, { assetId: ASSET }));
    documentFetch.mockResolvedValueOnce(
      json(409, { error: "Delete the stored file first." }),
    );
    expect(await deleteMediaFile(ASSET)).toEqual({
      ok: false,
      message: "Delete the stored file first.",
    });
  });
});

describe("media addresses for thumbnails (invariant 5)", () => {
  it("are the signed-in media route's bounded variants, never a storage address", () => {
    expect(mediaAddress(ASSET.toUpperCase(), "w320")).toBe(
      `/api/media/${ASSET}?variant=w320`,
    );
    expect(mediaAddress(ASSET)).toBe(`/api/media/${ASSET}`);
    expect(mediaAddress("../x", "w320")).toBeNull();
  });
});
