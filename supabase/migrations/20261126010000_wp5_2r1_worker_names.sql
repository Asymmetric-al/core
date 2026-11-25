-- AL-2678 (WP5 part 2-r1; plan section 12 WP5, line 1003: "A worker with an
-- alias appears under the alias in the donor portal, and the legal name does
-- not"; issue 2805 note 1 and obligation 2; D-16 ruling on WP5 part 2, Q8 and
-- Q9; W5-R12; R15). A worker's name outside Mission Control, and the safety
-- text.
--
-- Replaces, from 20261125050400_worker_safety_room.sql:
-- 1. private.normalize_safety_text(text) (lines 110-124): the same steps in
--    the same order (remove, compose NFC, every whitespace run one space,
--    trim, empty is NULL); only the removal class grows.
-- 2. public.worker_public_display_name(text, text, text) (lines 262-288):
--    its inline copy of the expression takes the same class, character for
--    character.
-- Both patterns are written as dollar-quoted literals inside the function
-- bodies, so they are never read as escape strings: a SQL function's body is
-- parsed again at each call under the caller's standard_conforming_strings,
-- and with it off the ordinary literals of 20261125050400 raise the warning
-- "nonstandard use of escape in a string literal" (their results do not
-- change). Nothing is pinned.
--
-- Adds:
-- 3. private.assignment_for_profile(uuid, uuid): the sole worker row
--    (public.missionaries) of a tenant and a profile, else NULL (R15; WP5
--    part 2-r3 reuses it).
-- 4. private.worker_public_name_for(uuid, uuid): the one keyed projection of a
--    worker's public name (W5-R12). It fails closed: a restricted or
--    high-risk worker (any level but standard and sensitive, NULL included)
--    gets the normalized alias or NULL, never parties.display_name, which can
--    hold the legal name; a standard or sensitive worker gets the alias, else
--    the normalized Party display name. It reads neither
--    private.party_restricted nor public.profiles.
-- 5. public.worker_public_name(public.missionaries) and
--    public.post_author_public_name(public.posts): computed columns for the
--    service key only (R21 F6), through 4 (and 3 for a post's author). Both
--    ignore parties.do_not_publish, which WP7's callers must apply (Q8).
--
-- What "removed", "blank" and "the same" mean (working rule 13):
-- Removed before anything else, from an alias, a legal name and a reason
-- alike (they are compared and shown, never the worker's own prose): every
-- default-ignorable code point, assigned or not, every format character but
-- the visible marks kept below, and every control character that is not
-- whitespace, namely
--   U+0001-U+0008, U+000E-U+001F, U+007F-U+0084, U+0086-U+009F (controls);
--   U+00AD soft hyphen; U+034F combining grapheme joiner; U+061C Arabic letter
--   mark; U+070F Syriac abbreviation mark (below); U+115F, U+1160, U+3164, U+FFA0 Hangul fillers; U+17B4, U+17B5 Khmer
--   inherent vowels; U+180B-U+180F Mongolian free variation selectors and
--   vowel separator; U+200B-U+200F zero-width space, non-joiner, joiner and
--   direction marks; U+202A-U+202E embeddings and overrides; U+2060-U+206F
--   word joiner, invisible operators, isolates, deprecated format characters
--   and the unassigned U+2065; U+2800 Braille blank; U+FE00-U+FE0F variation selectors; U+FEFF byte-order mark;
--   U+FFF0-U+FFFB, the unassigned U+FFF0-U+FFF8 and the interlinear
--   annotation characters; U+13430-U+1343F Egyptian hieroglyph format
--   controls; U+13441, U+13442 Egyptian hieroglyph full and half blank;
--   U+1BCA0-U+1BCA3 shorthand format controls; U+1D159 musical symbol null
--   notehead; U+1D173-U+1D17A musical format controls; U+E0000-U+E0FFF the tags, the variation
--   selectors U+E0100-U+E01EF and every unassigned code point between them.
--   tests/unit/acceptance/issue-2678/safety-text-classes.static derives the
--   three classes from the runtime's Unicode tables and fails on a code point
--   that a later Unicode version adds to them.
-- Blank, though no Unicode property says so: U+2800, U+13441, U+13442 and
--   U+1D159 are letters or symbols whose glyph draws no ink. Whether an
--   assigned letter or symbol draws ink is a property of fonts, not of
--   Unicode's tables, so no test can derive this class: it is a named list,
--   and a blank glyph that nobody has listed can still pass the alias rule
--   and the blank checks. That is the honest limit of this rule.
-- U+070F: the Unicode Standard (16.0, section 9.3.1, "Syriac Abbreviation
--   Mark") says "U+070F SYRIAC ABBREVIATION MARK (SAM) is a zero-width
--   formatting code that has no effect on the shaping process of Syriac
--   characters", and that it "specifies the beginning point of a Syriac
--   abbreviation, which is a line drawn horizontally above one or more
--   characters"; the line is drawn over the characters after it, and the
--   mark has no glyph of its own (section 9.2.1 counts it among the signs
--   whose span is rendered visibly). After a Latin name, or alone, it shows
--   nothing, so it is removed rather than kept.
-- Whitespace, unchanged, exactly White_Space (each run becomes one space):
--   U+0009-U+000D, U+0020, U+0085, U+00A0, U+1680, U+2000-U+200A, U+2028,
--   U+2029, U+202F, U+205F, U+3000.
-- Kept: the format marks that are visible in their scripts (U+0600-U+0605,
--   U+06DD, U+0890, U+0891, U+08E2, U+110BD, U+110CD); look-alike
--   letters of another script; characters whose lowercase depends on the
--   locale (issue 2805 note 3).
-- What the removal can damage, accepted: a variation selector after an emoji
--   or an ideograph (an ideographic variant of a name collapses to its base
--   character); a Hangul filler inside an old or incomplete jamo sequence
--   (precomposed Hangul is untouched); a Mongolian contextual form chosen by
--   a free variation selector; a Syriac abbreviation, which loses its
--   overline.
-- Blank: nothing is left after the steps above, so the function returns
--   NULL; a text of removed characters and whitespace only is blank.
-- The same (unchanged, 20261125050400 lines 173-180): lower() of the NFKC
--   forms of the normalized texts are equal.
--
-- Locks, observed in pg_locks inside the open transaction just before COMMIT
-- (PostgreSQL 17.11, nothing excluded): ACCESS SHARE on public.missionaries
-- and public.parties, taken when the SQL bodies are checked at creation, and
-- no stronger lock on any table; ROW EXCLUSIVE on the catalog pg_description
-- for the comments; object locks on the six functions it creates or replaces,
-- and ACCESS SHARE object locks on the row types missionaries and posts, the
-- schemas public and private and the roles authenticated and service_role.
-- ACCESS SHARE conflicts only with ACCESS EXCLUSIVE, so no read or write of
-- the live build waits on it. lock_timeout stops a run rather than queue it
-- behind a migration that holds ACCESS EXCLUSIVE.
--
-- Recovery. A run lost between its COMMIT and its ledger row replaces the two
-- functions again with the same text and then stops at its first CREATE
-- (private.assignment_for_profile, 42723), rolling back. This file has
-- committed when this read-only check is true: SELECT
-- to_regprocedure('public.worker_public_name(public.missionaries)') IS NOT
-- NULL. Then follow the steps of docs/ops/release-job.md, "If the migration
-- committed but its ledger row is missing", with this check and this file's
-- version, 20261126010000, in place of the section's own.
--
-- Down (only after the build that reads worker_public_name and
-- post_author_public_name is rolled back): DROP FUNCTION
-- public.post_author_public_name(public.posts),
-- public.worker_public_name(public.missionaries),
-- private.worker_public_name_for(uuid, uuid) and
-- private.assignment_for_profile(uuid, uuid); then run again, verbatim,
-- 20261125050400 lines 110-124 and 262-288 with CREATE OR REPLACE FUNCTION
-- in place of CREATE FUNCTION.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The one normalized form of a worker's names and of a command's reason.
-- public.worker_public_display_name repeats the same expression, because
-- signed-in callers may not use the private schema; the worker-safety and
-- worker-names suites fail if the two differ.
CREATE OR REPLACE FUNCTION private.normalize_safety_text(p_value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT NULLIF(pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.normalize(pg_catalog.regexp_replace(p_value, $re$[\u0001-\u0008\u000E-\u001F\u007F-\u0084\u0086-\u009F\u00AD\u034F\u061C\u070F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2800\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFFB\U00013430-\U0001343F\U00013441-\U00013442\U0001BCA0-\U0001BCA3\U0001D159\U0001D173-\U0001D17A\U000E0000-\U000E0FFF]$re$, '', 'g'), 'NFC'), $ws$[\u0009-\u000D\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+$ws$, ' ', 'g')), '');
$fn$;
COMMENT ON FUNCTION private.normalize_safety_text(TEXT) IS
  'A worker''s alias, legal name or a safety command''s reason in one form: invisible format characters, variation selectors, Hangul fillers, tags and control characters that are not whitespace removed; composed (NFC); every run of ASCII or Unicode whitespace one space; trimmed; NULL when nothing is left (AL-2678).';
ALTER FUNCTION private.normalize_safety_text(TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.normalize_safety_text(TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.normalize_safety_text(TEXT) TO tenant_guard;

-- 2. The pure name projection, with the same removal class.
CREATE OR REPLACE FUNCTION public.worker_public_display_name(
  p_public_alias TEXT,
  p_approved_profile_display_name TEXT,
  p_party_display_name TEXT
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT COALESCE(
    (SELECT n.name
       FROM (SELECT t.slot, NULLIF(pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.normalize(pg_catalog.regexp_replace(t.v, $re$[\u0001-\u0008\u000E-\u001F\u007F-\u0084\u0086-\u009F\u00AD\u034F\u061C\u070F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2800\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFFB\U00013430-\U0001343F\U00013441-\U00013442\U0001BCA0-\U0001BCA3\U0001D159\U0001D173-\U0001D17A\U000E0000-\U000E0FFF]$re$, '', 'g'), 'NFC'), $ws$[\u0009-\u000D\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+$ws$, ' ', 'g')), '') AS name
               FROM (VALUES (1, p_public_alias), (2, p_approved_profile_display_name)) AS t (slot, v)) AS n
      WHERE n.name IS NOT NULL
      ORDER BY n.slot
      LIMIT 1),
    p_party_display_name
  );
$fn$;
COMMENT ON FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) IS
  'A worker''s name outside Mission Control: the alias, else the approved profile''s display name, else the Party''s display name; never the legal name (plan 6.6, AL-2678).';
ALTER FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.worker_public_display_name(TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 3. The sole worker row of a tenant and a profile: two rows or none, or a
-- NULL argument, give NULL, so a profile is never guessed onto a worker.
CREATE FUNCTION private.assignment_for_profile(p_tenant_id UUID, p_profile_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT CASE WHEN pg_catalog.count(*) = 1 THEN (pg_catalog.array_agg(m.id))[1] END
    FROM public.missionaries AS m
   WHERE m.tenant_id = p_tenant_id
     AND m.profile_id = p_profile_id;
$fn$;
COMMENT ON FUNCTION private.assignment_for_profile(UUID, UUID) IS
  'The id of the sole public.missionaries row with this tenant and profile; NULL for none, several or a NULL argument (AL-2678, R15).';
ALTER FUNCTION private.assignment_for_profile(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.assignment_for_profile(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;

-- 4. The keyed projection. It fails closed by an allowlist: the Party display
-- name, which can hold the legal name, is used only for a standard or
-- sensitive worker; every other level, NULL included (restricted and
-- high-risk today), gets the alias or NULL.
CREATE FUNCTION private.worker_public_name_for(p_tenant_id UUID, p_assignment_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $fn$
  SELECT CASE
           WHEN p.security_level IN ('standard', 'sensitive')
             THEN private.normalize_safety_text(
                    public.worker_public_display_name(p.public_alias, NULL::TEXT, p.display_name))
           ELSE private.normalize_safety_text(p.public_alias)
         END
    FROM public.missionaries AS m
    JOIN public.parties AS p ON p.tenant_id = m.tenant_id AND p.id = m.party_id
   WHERE m.tenant_id = p_tenant_id
     AND m.id = p_assignment_id;
$fn$;
COMMENT ON FUNCTION private.worker_public_name_for(UUID, UUID) IS
  'A worker''s public name by tenant and assignment: for a standard or sensitive worker the alias, else the normalized Party display name; for any other level, restricted, high-risk, an unknown one or NULL, the normalized alias or NULL, never the Party display name. Reads neither party_restricted nor profiles (AL-2678, W5-R12).';
ALTER FUNCTION private.worker_public_name_for(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.worker_public_name_for(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;

-- 5. The computed columns, for the service key only: a signed-in or
-- anonymous caller can neither execute them nor read the row they take.
CREATE FUNCTION public.worker_public_name(p_worker public.missionaries)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
  SELECT private.worker_public_name_for(p_worker.tenant_id, p_worker.id);
$fn$;
COMMENT ON FUNCTION public.worker_public_name(public.missionaries) IS
  'A worker''s public name, a server-only lookup for the service key (R21 F6, AL-2678). It fails closed: a restricted or high-risk worker without an alias is NULL. It ignores parties.do_not_publish, which WP7''s callers must apply (D-16 Q8).';
ALTER FUNCTION public.worker_public_name(public.missionaries) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.worker_public_name(public.missionaries) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.worker_public_name(public.missionaries) TO service_role;

CREATE FUNCTION public.post_author_public_name(p_post public.posts)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
  SELECT private.worker_public_name_for(
    p_post.tenant_id,
    private.assignment_for_profile(p_post.tenant_id, p_post.missionary_id)
  );
$fn$;
COMMENT ON FUNCTION public.post_author_public_name(public.posts) IS
  'A post author''s public name, a server-only lookup for the service key (R21 F6, AL-2678): the author''s sole worker row in the post''s tenant, by worker_public_name''s rule; NULL for an organization post or an author without a sole worker row. It fails closed. It ignores parties.do_not_publish, which WP7''s callers must apply (D-16 Q8).';
ALTER FUNCTION public.post_author_public_name(public.posts) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.post_author_public_name(public.posts) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.post_author_public_name(public.posts) TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
