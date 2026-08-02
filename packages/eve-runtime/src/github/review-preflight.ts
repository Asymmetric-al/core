import {
  hasBlockingSandboxFinding,
  scanEveSandboxWrite,
} from "@asym/api/eve/sandbox";

const FILES_PER_PAGE = 100;
const MAX_FILE_PAGES = 30;

interface EveGithubReviewFile {
  filename?: unknown;
  patch?: unknown;
  previous_filename?: unknown;
  status?: unknown;
}

interface EveGithubReviewApi {
  request(input: { method: "GET"; path: string }): Promise<{ body: unknown }>;
}

function changedFileIsSafe(file: EveGithubReviewFile): boolean {
  if (
    typeof file.filename !== "string" ||
    file.filename.length === 0 ||
    typeof file.status !== "string"
  ) {
    return false;
  }

  if (typeof file.patch !== "string") return false;
  const paths = [file.filename];
  if (file.status === "renamed" || file.status === "copied") {
    if (
      typeof file.previous_filename !== "string" ||
      file.previous_filename.length === 0
    ) {
      return false;
    }
    paths.push(file.previous_filename);
  }

  return paths.every(
    (path) =>
      !hasBlockingSandboxFinding(
        scanEveSandboxWrite({ content: file.patch as string, path }),
      ),
  );
}

/**
 * Reads only GitHub's bounded changed-file metadata and patches, then rejects
 * sensitive paths or content before Eve's native channel loads the PR into a
 * model session or checks it out into the sandbox.
 */
export async function preflightEveGithubReview(input: {
  github: EveGithubReviewApi;
  owner: string;
  pullRequestNumber: number;
  repo: string;
}): Promise<boolean> {
  try {
    for (let page = 1; page <= MAX_FILE_PAGES; page += 1) {
      const response = await input.github.request({
        method: "GET",
        path: `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/pulls/${input.pullRequestNumber}/files?per_page=${FILES_PER_PAGE}&page=${page}`,
      });
      if (!Array.isArray(response.body)) return false;
      const files = response.body as EveGithubReviewFile[];
      if (!files.every(changedFileIsSafe)) return false;
      if (files.length < FILES_PER_PAGE) return true;
    }
  } catch {
    return false;
  }

  // A full final page means the bounded scan did not prove that every changed
  // file was inspected.
  return false;
}
