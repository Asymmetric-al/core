/**
 * #2708: selects that fail today because of product defects this check found.
 * They are reported (the #2708 workstream report), not fixed by the check.
 *
 * An entry explains one failing select: the file, table and PostgREST error
 * code must agree, and `match` (text specific to that select, such as the
 * broken embed) must occur in its select string or in PostgREST's message. It
 * does not use the line, so edits elsewhere in the file do not break it.
 * The sweep fails on any failure no entry explains, on an entry that matches
 * more than one failing select (select-failures.ts), and on an entry that no
 * longer fails: the change that fixes a defect deletes its entry in the same
 * pull request. Never add an entry to make a new failure pass.
 */
export type KnownSelectDefect = {
  file: string;
  table: string;
  code: string;
  /** Text specific to the failing select, found in it or in PostgREST's message. */
  match: string;
  defect: string;
};

export const KNOWN_SELECT_DEFECTS: readonly KnownSelectDefect[] = [
  {
    file: "packages/api/src/posts/comments.ts",
    table: "post_comments",
    code: "PGRST200",
    match: "user:profiles!user_id(",
    defect:
      "embeds profiles!user_id, but post_comments.user_id references auth.users(id), not profiles: GET /api/posts/[postId]/comments answers 500 on every migrated database",
  },
  {
    file: "packages/api/src/admin/comments/comment.ts",
    table: "post_comments",
    code: "PGRST200",
    match: "author:profiles!user_id(",
    defect:
      "the admin comment update returns the same profiles!user_id embed, so PostgREST refuses the PATCH before it runs and the route answers 500",
  },
];
