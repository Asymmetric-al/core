import { describe, expect, it, vi } from "vitest";

import {
  continueContributionBatch,
  readContributionBatchResponse,
} from "../../../../../apps/admin/app/(app)/contributions/batch-continuation";

function response(body: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  };
}

const runningBatch = {
  id: "batch_1",
  status: "running" as const,
  executionMode: "background" as const,
  summary: {
    processed: 0,
    succeeded: 0,
    skipped: 0,
    failed: 0,
    followUpTasksCreated: 0,
  },
};

const processAction = {
  method: "POST" as const,
  href: "/api/admin/contribution-batches/batch_1/process",
};

describe("contribution batch continuation", () => {
  it("continues a running batch through multiple bounded process requests", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          batch: {
            ...runningBatch,
            summary: { ...runningBatch.summary, processed: 25, succeeded: 25 },
          },
        }),
      )
      .mockResolvedValueOnce(
        response({
          batch: {
            ...runningBatch,
            status: "complete",
            summary: { ...runningBatch.summary, processed: 40, succeeded: 40 },
          },
        }),
      );
    const onProgress = vi.fn();

    const result = await continueContributionBatch({
      fetcher,
      initialResponse: {
        batch: runningBatch,
        nextAction: processAction,
      },
      maxProcessRequests: 3,
      onProgress,
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(1, processAction.href, {
      method: "POST",
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, processAction.href, {
      method: "POST",
    });
    expect(onProgress).toHaveBeenLastCalledWith(result.batch);
    expect(result.batch.status).toBe("complete");
    expect(result.batch.summary.processed).toBe(40);
  });

  it.each(["complete", "complete_with_issues", "failed", "cancelled"] as const)(
    "stops without another request when the batch is %s",
    async (status) => {
      const fetcher = vi.fn();
      const initialResponse = {
        batch: { ...runningBatch, status },
        nextAction: processAction,
      };

      const result = await continueContributionBatch({
        fetcher,
        initialResponse,
      });

      expect(result).toBe(initialResponse);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it("fails safely when a running batch has no process action", async () => {
    await expect(
      continueContributionBatch({
        fetcher: vi.fn(),
        initialResponse: { batch: runningBatch },
      }),
    ).rejects.toThrow("did not provide a continuation action");
  });

  it("rejects an unsafe process action instead of fetching an arbitrary URL", async () => {
    const fetcher = vi.fn();

    await expect(
      continueContributionBatch({
        fetcher,
        initialResponse: {
          batch: runningBatch,
          nextAction: {
            method: "POST",
            href: "https://example.com/collect",
          },
        },
      }),
    ).rejects.toThrow("invalid continuation action");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("stops at the explicit request bound while preserving the resume action", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(response({ batch: runningBatch }));
    const onContinuationAction = vi.fn();

    await expect(
      continueContributionBatch({
        fetcher,
        initialResponse: {
          batch: runningBatch,
          nextAction: processAction,
        },
        maxProcessRequests: 2,
        onContinuationAction,
      }),
    ).rejects.toThrow("paused after 2 process requests");

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(onContinuationAction).toHaveBeenLastCalledWith(processAction);
  });

  it("surfaces an API error message from a failed process request", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        response({ error: "Batch processing is unavailable." }, false),
      );

    await expect(
      continueContributionBatch({
        fetcher,
        initialResponse: {
          batch: runningBatch,
          nextAction: processAction,
        },
      }),
    ).rejects.toThrow("Batch processing is unavailable.");
  });

  it("rejects a successful response with an unknown batch status", async () => {
    await expect(
      readContributionBatchResponse(
        response({ batch: { ...runningBatch, status: "queued" } }),
        "Could not read contribution batch.",
      ),
    ).rejects.toThrow("Could not read contribution batch.");
  });
});
