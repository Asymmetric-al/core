import type { EditDonorFormValues } from "./edit-donor-form-model";

export type DonorActivityType = "note" | "call" | "meeting" | "email";
export type DonorMutationResult = { ok: true } | { ok: false; error: unknown };

async function readDonorMutationError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.length > 0) {
      return body.error;
    }
  } catch {
    // Fall through to a status-derived message when the response is not JSON.
  }

  return `Donor mutation failed with status ${response.status}`;
}

async function requestDonorMutation(
  donorId: string,
  pathSuffix: string,
  init: RequestInit,
): Promise<DonorMutationResult> {
  try {
    const response = await fetch(
      `/api/missionary/donors/${encodeURIComponent(donorId)}${pathSuffix}`,
      {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init.headers,
        },
      },
    );

    if (!response.ok) {
      return { ok: false, error: await readDonorMutationError(response) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export function insertDonorActivity(options: {
  donorId: string;
  activityType: DonorActivityType;
  note: string;
}): Promise<DonorMutationResult> {
  return requestDonorMutation(options.donorId, "/activities", {
    method: "POST",
    body: JSON.stringify({
      activityType: options.activityType,
      note: options.note,
    }),
  });
}

export function updateDonorTags(options: {
  donorId: string;
  tags: string[];
}): Promise<DonorMutationResult> {
  return requestDonorMutation(options.donorId, "", {
    method: "PATCH",
    body: JSON.stringify({ tags: options.tags }),
  });
}

export function updateDonorDetails(options: {
  donorId: string;
  value: EditDonorFormValues;
}): Promise<DonorMutationResult> {
  return requestDonorMutation(options.donorId, "", {
    method: "PATCH",
    body: JSON.stringify(options.value),
  });
}
