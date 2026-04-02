export function normalizeStoredPostContent(content: string): string {
  try {
    const parsed = JSON.parse(content) as unknown;

    if (
      parsed !== null &&
      typeof parsed === "object" &&
      (parsed as { type?: string }).type === "doc"
    ) {
      return JSON.stringify(parsed);
    }
  } catch {
    // Treat non-JSON content as legacy HTML/plain text and store as-is.
  }

  return content;
}
