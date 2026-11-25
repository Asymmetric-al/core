-- AL-2678 (WP5 part 2-r2s; plan section 12 WP5, line 1003; the D-16 ruling
-- on r2a's readers, point 2, and its gate, point 6; the coordinator's notes on
-- r2s, rulings Q1 to Q5). A person whom staff restricted, and who gives to a
-- colleague or asks to follow one, is an anonymous partner to that colleague:
-- a restriction changes public.parties only, and every reader a colleague
-- reaches named the donor from public.donors and public.profiles.
--
-- Adds:
-- 1. public.donor_is_restricted_party(public.donors), a computed column for
--    the service key only. It is false only when the donor has a Party in its
--    own organization and every Party linked to the donor's login, or to a
--    login of that Party, in any organization, is standard or sensitive;
--    otherwise true. A login is donors.profile_id, and the
--    account_links.user_id, missionaries.profile_id and donors.profile_id on
--    the donor's own Party (a profile's id is its login's id,
--    20261125050100_parties_account_links_and_own_rows.sql lines 224-226).
--    One hop: the Parties of those logins, not their logins in turn.
-- 2. missionaries_profile_party_idx and donors_profile_party_idx, each on
--    (profile_id, tenant_id, party_id) WHERE profile_id IS NOT NULL, IF NOT
--    EXISTS: the one definition of 20261126050000_wp5_2r2a_comment_authors.sql,
--    which owns them. With them the function finds a login's Parties in every
--    organization by one index probe per table, rather than reading
--    public.missionaries and public.donors in full for each donor row.
--
-- Never NULL: NOT EXISTS and EXISTS are never NULL, so a NULL row, a NULL
-- organization, a NULL Party and a NULL level all give true. A level is
-- compared as stored text, exactly: no case folding, trimming or Unicode
-- normalization, so any value but 'standard' and 'sensitive' is restricted.
--
-- Reads public.donors, public.parties, public.account_links and
-- public.missionaries; never public.profiles or private.party_restricted.
-- Every reader a colleague reaches selects the column beside
-- giving_preferences and passes it to isAnonymousToRecipient
-- (packages/api/src/missionary-portal/redaction.ts), which treats anything
-- but false as hidden.
--
-- Moves nothing else: no table, column, policy or existing grant; anon gets
-- no EXECUTE, so the catalog gate's anon allowlist does not move; a computed
-- column is a function, not an attribute, so no field policy moves.
--
-- Locks, observed in pg_locks inside the open transaction just before COMMIT
-- (PostgreSQL 17.11, on 20261126050000's chain and the seed, where the two
-- indexes exist): SHARE on public.missionaries, then public.donors, which
-- CREATE INDEX IF NOT EXISTS takes before it finds the index and skips, held
-- until COMMIT (writes to them wait, reads do not; the order a gift takes
-- them); ACCESS SHARE on public.donors, public.parties, public.account_links
-- and public.missionaries, taken when the body is checked at creation; ROW
-- EXCLUSIVE on pg_description for the comment; nothing stronger on any table.
-- Besides those: ACCESS EXCLUSIVE and SHARE UPDATE EXCLUSIVE object locks on
-- the new function, which no other session sees before COMMIT, and ACCESS
-- SHARE object locks on the row type donors, the schema public and the role
-- service_role. lock_timeout stops a run rather than queue it behind a long
-- writer.
--
-- Recovery. A run lost between its COMMIT and its ledger row stops at its
-- first statement, CREATE FUNCTION (42723, the function exists), and rolls
-- back. This file has committed when this read-only check is true: SELECT
-- to_regprocedure('public.donor_is_restricted_party(public.donors)') IS NOT
-- NULL AND to_regclass('public.missionaries_profile_party_idx') IS NOT NULL
-- AND to_regclass('public.donors_profile_party_idx') IS NOT NULL. Then follow
-- docs/ops/release-job.md, "If the migration committed but its ledger row is
-- missing", with this check and this file's version, 20261126060000, in place
-- of the section's own.
--
-- Down (only after the build that selects donor_is_restricted_party is rolled
-- back): DROP FUNCTION public.donor_is_restricted_party(public.donors); then,
-- on its own, SELECT pg_notify('pgrst', 'reload schema');. The two indexes
-- stay: 20261126050000 owns them, and its Down drops them.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The fact. Its own Party must exist in its own organization; then no
-- Party reached through the donor's logins, in any organization, may be
-- anything but standard or sensitive.
CREATE FUNCTION public.donor_is_restricted_party(p_donor public.donors)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
  WITH own_party AS (
    SELECT pt.tenant_id, pt.id
      FROM public.parties AS pt
     WHERE pt.tenant_id = p_donor.tenant_id
       AND pt.id = p_donor.party_id
  ),
  logins AS (
    SELECT p_donor.profile_id AS user_id
     WHERE p_donor.profile_id IS NOT NULL
    UNION
    SELECT al.user_id
      FROM own_party AS op
      JOIN public.account_links AS al
        ON al.tenant_id = op.tenant_id AND al.party_id = op.id
    UNION
    SELECT m.profile_id
      FROM own_party AS op
      JOIN public.missionaries AS m
        ON m.tenant_id = op.tenant_id AND m.party_id = op.id
     WHERE m.profile_id IS NOT NULL
    UNION
    SELECT d.profile_id
      FROM own_party AS op
      JOIN public.donors AS d
        ON d.tenant_id = op.tenant_id AND d.party_id = op.id
     WHERE d.profile_id IS NOT NULL
  ),
  linked AS (
    SELECT op.tenant_id, op.id AS party_id
      FROM own_party AS op
    UNION
    SELECT al.tenant_id, al.party_id
      FROM logins AS l
      JOIN public.account_links AS al ON al.user_id = l.user_id
    UNION
    SELECT m.tenant_id, m.party_id
      FROM logins AS l
      JOIN public.missionaries AS m ON m.profile_id = l.user_id
    UNION
    SELECT d.tenant_id, d.party_id
      FROM logins AS l
      JOIN public.donors AS d ON d.profile_id = l.user_id
     WHERE d.party_id IS NOT NULL
  )
  SELECT NOT EXISTS (SELECT 1 FROM own_party)
      OR EXISTS (
           SELECT 1
             FROM linked AS lk
             JOIN public.parties AS pt
               ON pt.tenant_id = lk.tenant_id AND pt.id = lk.party_id
            WHERE (pt.security_level IN ('standard', 'sensitive')) IS NOT TRUE
         );
$fn$;
COMMENT ON FUNCTION public.donor_is_restricted_party(public.donors) IS
  'True unless the donor has a Party in its own organization and every Party linked to its login, or to a login of that Party, in any organization, is standard or sensitive; never NULL. A server-only lookup for the service key: a colleague''s reader shows a donor only when it reads false (AL-2678).';
ALTER FUNCTION public.donor_is_restricted_party(public.donors) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.donor_is_restricted_party(public.donors) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.donor_is_restricted_party(public.donors) TO service_role;

-- 2. A login's Parties in every organization by one index probe per table,
-- in the order a gift takes the tables; the definition is r2a's, unchanged.
CREATE INDEX IF NOT EXISTS missionaries_profile_party_idx
  ON public.missionaries (profile_id, tenant_id, party_id) WHERE profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS donors_profile_party_idx
  ON public.donors (profile_id, tenant_id, party_id) WHERE profile_id IS NOT NULL;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
