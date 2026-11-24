-- AL-2678 (WP5 part 1; plan section 12 WP5, lines 980, 1000 and 1001; 5.4,
-- line 260; record section 9, line 582, D-64; coordinator rulings W5-R4 and
-- W5-R5; review findings B2 to B9 and the ruling on B4). The database half
-- of a donor's account claim.
--
-- 1. account_claim_requests gains its proof: the SHA-256 digest of the claim
--    token (32 bytes, unique where set; the raw token is never stored), its
--    expiry, its redemption time and the donor's normalized email when the
--    token was issued, which a token cannot lack. An index on id serves the
--    worker wrapper, which looks a claim up by id alone.
-- 2. The requester's own read of the table ends (W5-R4). A claimant sees a
--    request only after proving the address: public.account_claim_status
--    (tenant) returns status and three dates of the caller's own requests
--    whose token the caller redeemed (ruling on finding B4: an unproven row
--    would tell whether an organization holds an unclaimed donor with the
--    caller's address), and nothing unless the request's x-asym-tenant
--    names that tenant. SELECT for authenticated stays for the staff policy.
-- 3. tenant_guard.start_account_claim(tenant): a signed-in person whose Auth
--    email is confirmed (and whose login is not soft-deleted) opens a claim
--    on the unclaimed donor of that tenant with the same normalized email. A
--    platform operator never does. It never links or grants anything. Every
--    outcome, a match or none, answers {"status":"received"}; the outcome is
--    written to the audit log only, and a conflict on the matched branch
--    (a lock timeout, or a duplicate) is recorded as claim_already_open,
--    never answered differently.
-- 4. tenant_guard.issue_account_claim_token(tenant, claim, digest): the worker
--    step that sets the token's digest and its 24-hour expiry
--    (private.account_claim_token_lifetime) on an open claim whose requester
--    still exists and is not yet linked, and returns the donor's address. The
--    token's producer is the mail step (part 3), which keeps the raw token
--    and sends it; the person who started the claim never receives it from
--    the database, so a matching email alone proves nothing. The service key
--    reaches it through public.issue_account_claim_token(claim, digest), which
--    takes the tenant from the stored claim.
-- 5. tenant_guard.redeem_account_claim(tenant, token): the one valid
--    redemption links the caller to the donor's Party and gives or revives
--    their donor membership. Unknown, expired, used, another person's, a
--    platform operator, a login without a confirmed address, changed contact,
--    donor or caller already linked: each answers {"status":"refused"} and
--    writes its reason to the audit log only. The link insert cannot raise a
--    unique violation: a lost race is refused like any other.
-- 3 and 5 are pre-membership entries (scripts/verify/command-entry-boundaries.mjs):
-- the caller holds no membership yet, so neither opens with the preamble.
-- Each takes the caller from the session, refuses (42501, the lane's
-- message) a request whose organization header is missing, malformed or
-- names another organization than its argument, answers its neutral shape
-- for an inactive organization before entering it, and then takes its locks
-- in the repository's order: the organization FOR SHARE
-- (private.share_lock_tenant), the caller's membership rows FOR UPDATE in id
-- order, the donor's Party FOR UPDATE, the claim row FOR UPDATE; and it
-- re-checks under those locks before it writes.
--
-- Locks, all held to COMMIT. ACCESS EXCLUSIVE on account_claim_requests (its
-- new columns, constraints and policies; its two new indexes take SHARE
-- under that lock), and on account_links, which gains the guard's policy and
-- is new in this release. No other table is locked. lock_timeout stops a run
-- rather than queue it behind live traffic.
--
-- Recovery. Nothing here is written to run twice: a run lost between its
-- COMMIT and its ledger row stops on the next run at its first statement,
-- the ALTER TABLE that adds token_sha256 (42701), and
-- docs/ops/release-job.md, "If the migration committed but its ledger row is
-- missing", applies.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 1. The proof.
ALTER TABLE public.account_claim_requests
  ADD COLUMN token_sha256 BYTEA,
  ADD COLUMN token_expires_at TIMESTAMPTZ,
  ADD COLUMN token_redeemed_at TIMESTAMPTZ,
  ADD COLUMN donor_email_at_issue TEXT,
  ADD CONSTRAINT account_claim_requests_token_sha256_length_check
    CHECK (token_sha256 IS NULL OR pg_catalog.octet_length(token_sha256) = 32),
  ADD CONSTRAINT account_claim_requests_token_pair_check
    CHECK ((token_sha256 IS NULL) = (token_expires_at IS NULL)
           AND (token_sha256 IS NULL OR donor_email_at_issue IS NOT NULL));
CREATE UNIQUE INDEX account_claim_requests_token_sha256_uidx
  ON public.account_claim_requests (token_sha256)
  WHERE token_sha256 IS NOT NULL;
CREATE INDEX account_claim_requests_id_idx
  ON public.account_claim_requests (id);
COMMENT ON COLUMN public.account_claim_requests.token_sha256 IS
  'SHA-256 (32 bytes) of the UTF-8 bytes of the claim token; never the token itself (AL-2678).';

-- 2. The claimant's read.
DROP POLICY account_claim_requests_requester_select ON public.account_claim_requests;

CREATE FUNCTION public.account_claim_status(p_tenant_id UUID)
RETURNS TABLE (
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_request_tenant_id UUID;
BEGIN
  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;
  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM p_tenant_id THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT c.status, c.created_at, c.updated_at, c.resolved_at
    FROM public.account_claim_requests AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.requested_by = auth.uid()
     AND c.token_redeemed_at IS NOT NULL
   ORDER BY c.created_at DESC, c.id;
END;
$$;
COMMENT ON FUNCTION public.account_claim_status(UUID) IS
  'The caller''s own claim requests in the request''s tenant whose token they redeemed: status and three dates, nothing else (W5-R4, ruling on review finding B4, AL-2678).';
ALTER FUNCTION public.account_claim_status(UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.account_claim_status(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.account_claim_status(UUID) TO authenticated;

-- What the commands may read and write.
CREATE FUNCTION private.account_claim_token_lifetime()
RETURNS INTERVAL
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT INTERVAL '24 hours';
$$;
COMMENT ON FUNCTION private.account_claim_token_lifetime() IS
  'How long a claim token stays valid (W5-R5): ADR-0025 leaves expiry to the producer.';

CREATE FUNCTION private.login_confirmed_email(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.normalize_email(u.email)
    FROM auth.users AS u
   WHERE u.id = p_user_id
     AND u.email_confirmed_at IS NOT NULL
     AND (pg_catalog.to_jsonb(u) ->> 'deleted_at') IS NULL;
$$;

CREATE FUNCTION private.account_claim_donor(p_tenant_id UUID, p_email_normalized TEXT)
RETURNS TABLE (donor_id UUID, party_id UUID, email TEXT, email_normalized TEXT, linked BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT d.id, d.party_id, d.email, d.email_normalized,
         d.profile_id IS NOT NULL OR EXISTS (
           SELECT 1 FROM public.account_links AS al
            WHERE al.tenant_id = d.tenant_id AND al.party_id = d.party_id
         )
    FROM public.donors AS d
   WHERE d.tenant_id = p_tenant_id
     AND d.party_id IS NOT NULL
     AND d.email_normalized = p_email_normalized;
$$;

CREATE FUNCTION private.account_claim_donor_by_id(p_tenant_id UUID, p_donor_id UUID)
RETURNS TABLE (donor_id UUID, party_id UUID, email TEXT, email_normalized TEXT, linked BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT d.id, d.party_id, d.email, d.email_normalized,
         d.profile_id IS NOT NULL OR EXISTS (
           SELECT 1 FROM public.account_links AS al
            WHERE al.tenant_id = d.tenant_id AND al.party_id = d.party_id
         )
    FROM public.donors AS d
   WHERE d.tenant_id = p_tenant_id
     AND d.id = p_donor_id
     AND d.party_id IS NOT NULL;
$$;

ALTER FUNCTION private.account_claim_token_lifetime() OWNER TO postgres;
ALTER FUNCTION private.login_confirmed_email(UUID) OWNER TO postgres;
ALTER FUNCTION private.account_claim_donor(UUID, TEXT) OWNER TO postgres;
ALTER FUNCTION private.account_claim_donor_by_id(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION private.account_claim_token_lifetime() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.login_confirmed_email(UUID) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.account_claim_donor(UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION private.account_claim_donor_by_id(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.account_claim_token_lifetime() TO tenant_guard;
GRANT EXECUTE ON FUNCTION private.login_confirmed_email(UUID) TO tenant_guard;
GRANT EXECUTE ON FUNCTION private.account_claim_donor(UUID, TEXT) TO tenant_guard;
GRANT EXECUTE ON FUNCTION private.account_claim_donor_by_id(UUID, UUID) TO tenant_guard;

GRANT SELECT, INSERT ON TABLE public.account_claim_requests TO tenant_guard;
GRANT UPDATE (status, token_sha256, token_expires_at, token_redeemed_at, donor_email_at_issue, resolved_at, updated_at)
  ON TABLE public.account_claim_requests TO tenant_guard;
CREATE POLICY tenant_guard_isolation ON public.account_claim_requests
  FOR ALL TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

GRANT SELECT, INSERT ON TABLE public.account_links TO tenant_guard;
CREATE POLICY tenant_guard_isolation ON public.account_links
  FOR ALL TO tenant_guard
  USING (tenant_id = tenant_guard.current_tenant_id())
  WITH CHECK (tenant_id = tenant_guard.current_tenant_id());

-- 3. Start a claim.
CREATE FUNCTION tenant_guard.start_account_claim(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID;
  v_request_tenant_id UUID;
  v_email TEXT;
  v_donor RECORD;
  v_outcome TEXT;
  v_claim UUID;
BEGIN
  v_user := tenant_guard.caller_id();
  IF v_user IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('status', 'received');
  END IF;

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;
  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  IF (private.share_lock_tenant(p_tenant_id) = 'active') IS NOT TRUE THEN
    RETURN pg_catalog.jsonb_build_object('status', 'received');
  END IF;
  PERFORM tenant_guard.enter(p_tenant_id);

  PERFORM 1
     FROM authz.memberships AS m
    WHERE m.tenant_id = p_tenant_id
      AND m.user_id = v_user
    ORDER BY m.id
      FOR UPDATE;

  v_email := private.login_confirmed_email(v_user);
  IF v_email IS NULL THEN
    v_outcome := 'email_not_confirmed';
  ELSIF private.is_platform_operator(v_user) THEN
    v_outcome := 'platform_operator';
  ELSIF EXISTS (
    SELECT 1 FROM public.account_links AS al
     WHERE al.tenant_id = p_tenant_id AND al.user_id = v_user
  ) THEN
    v_outcome := 'caller_already_linked';
  ELSE
    SELECT * INTO v_donor FROM private.account_claim_donor(p_tenant_id, v_email);
    IF NOT FOUND THEN
      v_outcome := 'no_matching_donor';
    ELSIF v_donor.linked THEN
      v_outcome := 'donor_already_linked';
    ELSE
      BEGIN
        PERFORM 1
           FROM public.parties AS p
          WHERE p.tenant_id = p_tenant_id
            AND p.id = v_donor.party_id
            FOR UPDATE;
        SELECT * INTO v_donor FROM private.account_claim_donor_by_id(p_tenant_id, v_donor.donor_id);
        IF NOT FOUND THEN
          v_outcome := 'no_matching_donor';
        ELSIF v_donor.linked THEN
          v_outcome := 'donor_already_linked';
        ELSIF EXISTS (
          SELECT 1 FROM public.account_claim_requests AS c
           WHERE c.tenant_id = p_tenant_id
             AND c.requested_by = v_user
             AND c.donor_id = v_donor.donor_id
             AND c.status = 'pending'
             AND c.token_redeemed_at IS NULL
             AND (c.token_expires_at IS NULL OR c.token_expires_at > pg_catalog.now())
        ) THEN
          v_outcome := 'claim_already_open';
        ELSE
          INSERT INTO public.account_claim_requests (
            tenant_id, donor_id, email, requested_by, status, match_type, match_confidence
          )
          VALUES (p_tenant_id, v_donor.donor_id, v_email, v_user, 'pending', 'confirmed_email', 'exact')
          RETURNING id INTO v_claim;
          v_outcome := 'claim_opened';
        END IF;
      EXCEPTION WHEN unique_violation OR lock_not_available THEN
        v_claim := NULL;
        v_outcome := 'claim_already_open';
      END;
    END IF;
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    p_tenant_id, v_user, 'account_claim_started', 'account_claim', v_claim::TEXT,
    pg_catalog.jsonb_build_object('outcome', v_outcome)
  );

  RETURN pg_catalog.jsonb_build_object('status', 'received');
END;
$$;

-- 4. Issue its token (worker).
CREATE FUNCTION tenant_guard.issue_account_claim_token(
  p_tenant_id UUID,
  p_claim_id UUID,
  p_token_sha256 BYTEA
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_claim RECORD;
  v_donor RECORD;
  v_expires TIMESTAMPTZ;
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);
  IF (private.share_lock_tenant(p_tenant_id) = 'active') IS NOT TRUE THEN
    RETURN pg_catalog.jsonb_build_object('issued', false, 'tenant_id', tenant_guard.current_tenant_id());
  END IF;

  SELECT c.id, c.donor_id, c.email_normalized, c.requested_by, c.status, c.token_sha256
    INTO v_claim
    FROM public.account_claim_requests AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.id = p_claim_id
   FOR UPDATE;
  IF NOT FOUND
     OR v_claim.status <> 'pending'
     OR v_claim.token_sha256 IS NOT NULL
     OR v_claim.donor_id IS NULL
     OR v_claim.requested_by IS NULL
     OR p_token_sha256 IS NULL
     OR pg_catalog.octet_length(p_token_sha256) <> 32 THEN
    RETURN pg_catalog.jsonb_build_object('issued', false, 'tenant_id', tenant_guard.current_tenant_id());
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.account_links AS al
     WHERE al.tenant_id = p_tenant_id AND al.user_id = v_claim.requested_by
  ) THEN
    RETURN pg_catalog.jsonb_build_object('issued', false, 'tenant_id', tenant_guard.current_tenant_id());
  END IF;

  SELECT * INTO v_donor FROM private.account_claim_donor_by_id(p_tenant_id, v_claim.donor_id);
  IF NOT FOUND OR v_donor.linked OR v_donor.email_normalized IS DISTINCT FROM v_claim.email_normalized THEN
    RETURN pg_catalog.jsonb_build_object('issued', false, 'tenant_id', tenant_guard.current_tenant_id());
  END IF;

  v_expires := pg_catalog.now() + private.account_claim_token_lifetime();
  UPDATE public.account_claim_requests AS c
     SET token_sha256 = p_token_sha256,
         token_expires_at = v_expires,
         donor_email_at_issue = v_donor.email_normalized,
         updated_at = pg_catalog.now()
   WHERE c.tenant_id = p_tenant_id
     AND c.id = v_claim.id;

  RETURN pg_catalog.jsonb_build_object(
    'issued', true,
    'tenant_id', tenant_guard.current_tenant_id(),
    'claim_id', v_claim.id,
    'email', v_donor.email,
    'expires_at', v_expires
  );
END;
$$;

-- 5. Redeem it.
CREATE FUNCTION tenant_guard.redeem_account_claim(p_tenant_id UUID, p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID;
  v_request_tenant_id UUID;
  v_found RECORD;
  v_known BOOLEAN;
  v_claim RECORD;
  v_donor RECORD;
  v_reason TEXT;
  v_link UUID;
BEGIN
  v_user := tenant_guard.caller_id();
  IF v_user IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('status', 'refused');
  END IF;

  BEGIN
    v_request_tenant_id := authz.request_tenant_id();
  EXCEPTION WHEN invalid_text_representation THEN
    v_request_tenant_id := NULL;
  END;
  IF v_request_tenant_id IS NULL OR v_request_tenant_id IS DISTINCT FROM p_tenant_id THEN
    RAISE EXCEPTION 'tenant_guard: request tenant scope is required and must match command tenant'
      USING ERRCODE = '42501';
  END IF;

  IF p_token IS NULL OR (private.share_lock_tenant(p_tenant_id) = 'active') IS NOT TRUE THEN
    RETURN pg_catalog.jsonb_build_object('status', 'refused');
  END IF;
  PERFORM tenant_guard.enter(p_tenant_id);

  PERFORM 1
     FROM authz.memberships AS m
    WHERE m.tenant_id = p_tenant_id
      AND m.user_id = v_user
    ORDER BY m.id
      FOR UPDATE;

  SELECT c.id, c.donor_id
    INTO v_found
    FROM public.account_claim_requests AS c
   WHERE c.tenant_id = p_tenant_id
     AND c.token_sha256 = pg_catalog.sha256(pg_catalog.convert_to(p_token, 'UTF8'));
  v_known := FOUND;

  IF v_known THEN
    PERFORM 1
       FROM public.parties AS p
      WHERE p.tenant_id = p_tenant_id
        AND p.id = (
          SELECT d.party_id FROM private.account_claim_donor_by_id(p_tenant_id, v_found.donor_id) AS d
        )
        FOR UPDATE;
    SELECT c.id, c.donor_id, c.requested_by, c.status, c.token_expires_at,
           c.token_redeemed_at, c.donor_email_at_issue
      INTO v_claim
      FROM public.account_claim_requests AS c
     WHERE c.tenant_id = p_tenant_id
       AND c.id = v_found.id
     FOR UPDATE;
  END IF;

  IF NOT v_known THEN
    v_reason := 'unknown_token';
  ELSIF v_claim.token_redeemed_at IS NOT NULL THEN
    v_reason := 'already_redeemed';
  ELSIF v_claim.token_expires_at <= pg_catalog.now() THEN
    v_reason := 'expired';
  ELSIF v_claim.requested_by IS DISTINCT FROM v_user THEN
    v_reason := 'wrong_user';
  ELSIF v_claim.status <> 'pending' THEN
    v_reason := 'not_pending';
  ELSIF private.is_platform_operator(v_user) THEN
    v_reason := 'platform_operator';
  ELSIF private.login_confirmed_email(v_user) IS NULL THEN
    v_reason := 'login_not_confirmed';
  ELSE
    SELECT * INTO v_donor FROM private.account_claim_donor_by_id(p_tenant_id, v_claim.donor_id);
    IF NOT FOUND
       OR v_claim.donor_email_at_issue IS NULL
       OR v_donor.email_normalized IS DISTINCT FROM v_claim.donor_email_at_issue THEN
      v_reason := 'contact_changed';
    ELSIF v_donor.linked THEN
      v_reason := 'donor_already_linked';
    ELSIF EXISTS (
      SELECT 1 FROM public.account_links AS al
       WHERE al.tenant_id = p_tenant_id AND al.user_id = v_user
    ) THEN
      v_reason := 'caller_already_linked';
    END IF;
  END IF;

  IF v_reason IS NULL THEN
    INSERT INTO public.account_links (tenant_id, user_id, party_id, linked_via)
    VALUES (p_tenant_id, v_user, v_donor.party_id, 'account_claim')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_link;
    IF v_link IS NULL THEN
      v_reason := 'caller_already_linked';
    END IF;
  END IF;

  IF v_reason IS NOT NULL THEN
    INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
    VALUES (
      p_tenant_id, v_user, 'account_claim_refused', 'account_claim', v_found.id::TEXT,
      pg_catalog.jsonb_build_object('reason', v_reason)
    );
    RETURN pg_catalog.jsonb_build_object('status', 'refused');
  END IF;

  UPDATE public.account_claim_requests AS c
     SET status = 'verified',
         token_redeemed_at = pg_catalog.now(),
         resolved_at = pg_catalog.now(),
         updated_at = pg_catalog.now()
   WHERE c.tenant_id = p_tenant_id
     AND c.id = v_claim.id;

  UPDATE authz.memberships AS m
     SET is_active = true,
         granted_by = v_user,
         updated_at = pg_catalog.now()
   WHERE m.user_id = v_user
     AND m.tenant_id = p_tenant_id
     AND m.role = 'donor'
     AND m.staff_role IS NULL;
  IF NOT FOUND THEN
    INSERT INTO authz.memberships (user_id, tenant_id, role, is_active, granted_by)
    VALUES (v_user, p_tenant_id, 'donor', true, v_user);
  END IF;

  INSERT INTO public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
  VALUES (
    p_tenant_id, v_user, 'account_claim_redeemed', 'account_claim', v_claim.id::TEXT,
    pg_catalog.jsonb_build_object('donor_id', v_claim.donor_id, 'party_id', v_donor.party_id)
  );

  RETURN pg_catalog.jsonb_build_object('status', 'linked');
END;
$$;

COMMENT ON FUNCTION tenant_guard.start_account_claim(UUID) IS
  'Pre-membership human command (AL-2678, W5-R5): opens a claim on the unclaimed donor whose email matches the caller''s confirmed Auth email, in the organization the request names. Answers {"status":"received"} for every outcome.';
COMMENT ON FUNCTION tenant_guard.issue_account_claim_token(UUID, UUID, BYTEA) IS
  'Worker command (AL-2678): sets the digest and 24-hour expiry of an open claim''s token and returns the address the mail step sends it to.';
COMMENT ON FUNCTION tenant_guard.redeem_account_claim(UUID, TEXT) IS
  'Pre-membership human command (AL-2678, W5-R5): redeems a claim token once, in the organization the request names, linking the caller to the donor''s Party with a donor membership. Answers {"status":"refused"} for every failure.';

REVOKE ALL ON FUNCTION tenant_guard.start_account_claim(UUID) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.issue_account_claim_token(UUID, UUID, BYTEA) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION tenant_guard.redeem_account_claim(UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.start_account_claim(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION tenant_guard.issue_account_claim_token(UUID, UUID, BYTEA) TO service_role;
GRANT EXECUTE ON FUNCTION tenant_guard.redeem_account_claim(UUID, TEXT) TO authenticated;

GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
ALTER FUNCTION tenant_guard.start_account_claim(UUID) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.issue_account_claim_token(UUID, UUID, BYTEA) OWNER TO tenant_guard;
ALTER FUNCTION tenant_guard.redeem_account_claim(UUID, TEXT) OWNER TO tenant_guard;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

CREATE FUNCTION public.start_account_claim(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.start_account_claim(p_tenant_id);
$$;

CREATE FUNCTION public.redeem_account_claim(p_tenant_id UUID, p_token TEXT)
RETURNS JSONB
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT tenant_guard.redeem_account_claim(p_tenant_id, p_token);
$$;

CREATE FUNCTION public.issue_account_claim_token(p_claim_id UUID, p_token_sha256 BYTEA)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_claim_tenant UUID;
BEGIN
  SELECT c.tenant_id INTO v_claim_tenant FROM public.account_claim_requests AS c WHERE c.id = p_claim_id;
  IF v_claim_tenant IS NULL THEN
    RETURN jsonb_build_object('issued', false);
  END IF;
  RETURN tenant_guard.issue_account_claim_token(v_claim_tenant, p_claim_id, p_token_sha256);
END;
$$;

COMMENT ON FUNCTION public.start_account_claim(UUID) IS
  'Wrapper of tenant_guard.start_account_claim for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.redeem_account_claim(UUID, TEXT) IS
  'Wrapper of tenant_guard.redeem_account_claim for the Data API (AL-2678). Runs as the caller; EXECUTE for authenticated only.';
COMMENT ON FUNCTION public.issue_account_claim_token(UUID, BYTEA) IS
  'Worker wrapper of tenant_guard.issue_account_claim_token (AL-2678): takes the tenant from the stored claim. EXECUTE for service_role only.';

ALTER FUNCTION public.start_account_claim(UUID) OWNER TO postgres;
ALTER FUNCTION public.redeem_account_claim(UUID, TEXT) OWNER TO postgres;
ALTER FUNCTION public.issue_account_claim_token(UUID, BYTEA) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.start_account_claim(UUID) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.redeem_account_claim(UUID, TEXT) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.issue_account_claim_token(UUID, BYTEA) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.start_account_claim(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_account_claim(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_account_claim_token(UUID, BYTEA) TO service_role;

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
