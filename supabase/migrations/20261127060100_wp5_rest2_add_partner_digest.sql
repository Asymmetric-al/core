-- AL-2678 (WP5 rest, pull request 2a, item zero (c) and (f); issue 2835's
-- comments of 27 November; ruling decision-wp5-rest-1-confirm-findings
-- section 2c; the coordinator's word of 27 November on (f)). Add Partner
-- keeps nothing a person typed in its command log, and stores a preferred
-- contact the partner has.
--
-- 1. tenant_guard.add_partner: its text from 20261126200200 with three
--    changes. (a) The command log row's command_payload is
--    {"sha256": <hex>}, the SHA-256 of the canonical payload's text (the
--    jsonb of name, phone and location in private.normalize_safety_text's
--    form, type and frequency, whose text form is the same for the same
--    keys and values however built), never the name, phone or location.
--    (b) A replay compares that digest with the stored one, so the same
--    details from the same caller still answer the stored pair and other
--    details are still a key conflict (23505, hint add_partner_key). (c) The
--    donor's preferred_contact is 'phone' when a phone was given, else NULL
--    (no channel): the partner has no e-mail, so the column's default
--    'email' named a channel they do not have. Signature, owner, grants and
--    answers otherwise unchanged.
-- 2. The guard may insert donors.preferred_contact (its INSERT column list
--    gains it).
-- 3. Every stored missionary.partner.create payload that holds more than a
--    digest is rewritten to the digest of its own text, which is the digest
--    the command computes for the same submission, so a retry of a
--    submission made before this file still answers its pair. A notice
--    reports the count. Other commands' rows are not read or changed.
-- 4. The donors add_partner made (a crm_command_logs row of action
--    missionary.partner.create, resource_type 'donor', whose resource_id is
--    the donor's id, in the donor's tenant) that have no e-mail (blank by
--    private.normalize_safety_text, the brief's rule 13) and the default
--    preference 'email' get 'phone' where the phone is not blank by the same
--    function, else NULL. No other donor row changes. Each corrected donor
--    gets one audit_logs row (action donor_preferred_contact_corrected,
--    resource the donor, details {"migration": "20261127060100", "from":
--    "email", "to": <the new preference>}), which the Down reads. A notice
--    reports the count.
--
-- Locks, all held to COMMIT: ROW EXCLUSIVE on crm_command_logs, donors and
-- audit_logs for the two updates and the audit rows, which lock only the
-- rows they change; object locks on the function. lock_timeout stops a run
-- rather than queue it behind live traffic.
--
-- What the running build does: it calls public.add_partner with the same
-- arguments and gets the same answers; the stored log row and the new
-- partner's preference differ as above.
--
-- Recovery. The function's CREATE OR REPLACE and both updates run again
-- unchanged and change nothing more (no audit row either), so a second run
-- of the applied file commits the same state. This file has committed when
-- this read-only check returns true (false before it, never an error):
-- Check begins
--   SELECT pg_catalog.has_column_privilege('tenant_guard', 'public.donors', 'preferred_contact', 'INSERT') AS committed;
-- Check ends
-- Then follow docs/ops/release-job.md, "If the migration committed but its
-- ledger row is missing", with this check and this file's version,
-- 20261127060100.
--
-- Down (after the build that calls it is rolled back; one transaction):
-- the command's text and comment from 20261126200200 replaced as its
-- owner, the column grant revoked, and 'email' given back to exactly the
-- donors item 4 corrected (its audit rows name them) that still hold the
-- value it set; a preference anyone has chosen since, and every donor item
-- 4 did not touch, stay. The audit rows stay.
-- Down begins
--   BEGIN;
--   SET LOCAL lock_timeout = '5s';
--   GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
--   SET LOCAL ROLE tenant_guard;
--   CREATE OR REPLACE FUNCTION tenant_guard.add_partner(
--   \lines 247-485 of 20261126200200_wp5_rest_add_partner.sql
--   RESET ROLE;
--   REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;
--   REVOKE INSERT (preferred_contact) ON TABLE public.donors FROM tenant_guard;
--   UPDATE public.donors AS d SET preferred_contact = 'email'
--     FROM public.audit_logs AS a
--    WHERE a.tenant_id = d.tenant_id
--      AND a.action = 'donor_preferred_contact_corrected'
--      AND a.resource_type = 'donor'
--      AND a.resource_id = d.id::TEXT
--      AND a.details ->> 'migration' = '20261127060100'
--      AND d.preferred_contact IS NOT DISTINCT FROM a.details ->> 'to';
--   COMMIT;
--   SELECT pg_notify('pgrst', 'reload schema');
-- Down ends
-- The digests stay: what was typed cannot be recovered from them, and the
-- old function compares a replay with the payload it would store, so a
-- retry of a submission made under this file answers a key conflict after a
-- Down.

BEGIN;
SET LOCAL lock_timeout = '5s';

-- 2. The guard's new column.
GRANT INSERT (preferred_contact) ON TABLE public.donors TO tenant_guard;

-- 1. The command.
-- Replaced as its owner, which holds CREATE on its schema only for this.
GRANT CREATE ON SCHEMA tenant_guard TO tenant_guard;
SET LOCAL ROLE tenant_guard;
CREATE OR REPLACE FUNCTION tenant_guard.add_partner(
  p_tenant_id UUID,
  p_idempotency_key UUID,
  p_name TEXT,
  p_phone TEXT,
  p_type TEXT,
  p_frequency TEXT,
  p_location TEXT,
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_ctx tenant_guard.command_context;
  v_status TEXT;
  v_live BOOLEAN;
  v_capable BOOLEAN;
  v_link_party UUID;
  v_workers INTEGER;
  v_worker_login UUID;
  v_key TEXT;
  v_name TEXT;
  v_phone TEXT;
  v_location TEXT;
  v_payload JSONB;
  v_digest JSONB;
  v_log_id UUID;
  v_log_action TEXT;
  v_log_actor UUID;
  v_log_payload JSONB;
  v_log_result JSONB;
  v_party_id UUID;
  v_donor_id UUID;
  v_constraint TEXT;
BEGIN
  v_ctx := tenant_guard.begin_human_command(p_tenant_id, 'partners.add');

  IF v_ctx.role IS DISTINCT FROM 'missionary' THEN
    RAISE EXCEPTION 'tenant_guard: only a missionary assignment adds a partner'
      USING ERRCODE = '42501';
  END IF;

  v_key := p_idempotency_key::TEXT;
  v_name := private.normalize_safety_text(p_name);
  v_phone := private.normalize_safety_text(p_phone);
  v_location := private.normalize_safety_text(p_location);

  IF v_key IS NULL
     OR COALESCE(pg_catalog.char_length(v_name), 0) NOT BETWEEN 2 AND 200
     OR COALESCE(pg_catalog.char_length(v_location), 0) NOT BETWEEN 2 AND 200
     OR COALESCE(pg_catalog.char_length(v_phone), 0) > 50
     OR p_type IS NULL
     OR p_type NOT IN ('Individual', 'Organization', 'Church')
     OR p_frequency IS NULL
     OR p_frequency NOT IN ('Monthly', 'One-Time', 'Annually', 'Irregular') THEN
    RAISE EXCEPTION 'tenant_guard: the partner is not valid'
      USING ERRCODE = '22023';
  END IF;

  v_payload := pg_catalog.jsonb_build_object(
    'name', v_name,
    'phone', v_phone,
    'type', p_type,
    'frequency', p_frequency,
    'location', v_location
  );
  v_digest := pg_catalog.jsonb_build_object(
    'sha256',
    pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_payload::TEXT, 'UTF8')), 'hex')
  );

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('add_partner'),
    pg_catalog.hashtext(v_ctx.tenant_id::TEXT || ':' || v_key)
  );

  v_status := private.share_lock_tenant(v_ctx.tenant_id);

  IF v_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'tenant_guard: the organization is not active'
      USING ERRCODE = '42501';
  END IF;

  SELECT true
    INTO v_live
    FROM authz.memberships AS m
   WHERE m.id = v_ctx.assignment_id
     AND m.user_id = v_ctx.actor_id
     AND m.tenant_id = v_ctx.tenant_id
     AND m.role = 'missionary'
     AND m.is_active
     AND m.revoked_at IS NULL
     FOR SHARE;

  IF v_live IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment is no longer a live missionary assignment of the caller in this tenant'
      USING ERRCODE = '42501';
  END IF;

  v_capable := 'partners.add' = ANY (authz.assignment_capabilities(v_ctx.assignment_id));

  IF v_capable IS NOT TRUE THEN
    RAISE EXCEPTION 'tenant_guard: the selected assignment no longer holds partners.add'
      USING ERRCODE = '42501';
  END IF;

  SELECT al.party_id
    INTO v_link_party
    FROM public.account_links AS al
   WHERE al.tenant_id = v_ctx.tenant_id
     AND al.user_id = v_ctx.actor_id;

  SELECT pg_catalog.count(*)::INTEGER
    INTO v_workers
    FROM public.missionaries AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.party_id = v_link_party;

  IF v_link_party IS NULL OR v_workers <> 1 THEN
    RAISE EXCEPTION 'tenant_guard: the caller has no single worker row in this tenant through their account link'
      USING ERRCODE = '42501';
  END IF;

  SELECT m.profile_id
    INTO v_worker_login
    FROM public.missionaries AS m
   WHERE m.tenant_id = v_ctx.tenant_id
     AND m.party_id = v_link_party;

  IF v_worker_login IS NULL THEN
    RAISE EXCEPTION 'tenant_guard: the caller''s worker row has no login'
      USING ERRCODE = '42501';
  END IF;

  SELECT l.id, l.action, l.actor_user_id, l.command_payload, l.result_summary
    INTO v_log_id, v_log_action, v_log_actor, v_log_payload, v_log_result
    FROM public.crm_command_logs AS l
   WHERE l.tenant_id = v_ctx.tenant_id
     AND l.idempotency_key = v_key;

  IF v_log_id IS NOT NULL THEN
    IF v_log_action IS DISTINCT FROM 'missionary.partner.create'
       OR v_log_actor IS DISTINCT FROM v_ctx.actor_id
       OR v_log_payload IS DISTINCT FROM v_digest THEN
      RAISE EXCEPTION 'tenant_guard: this submission key was used for another partner'
        USING ERRCODE = '23505', HINT = 'add_partner_key';
    END IF;

    RETURN pg_catalog.jsonb_build_object(
      'donorId', v_log_result ->> 'donorId',
      'partyId', v_log_result ->> 'partyId',
      'commandLogId', v_log_id,
      'duplicate', true
    );
  END IF;

  v_party_id := public.donor_party_for_insert(v_ctx.tenant_id, NULL, v_name, NULL);

  BEGIN
    INSERT INTO public.donors (
      tenant_id,
      party_id,
      missionary_id,
      name,
      phone,
      preferred_contact,
      type,
      frequency,
      location,
      status,
      total_given,
      last_gift_amount,
      score,
      giving_preferences
    )
    VALUES (
      v_ctx.tenant_id,
      v_party_id,
      v_worker_login,
      v_name,
      v_phone,
      CASE WHEN v_phone IS NOT NULL THEN 'phone' END,
      p_type,
      p_frequency,
      v_location,
      'Active',
      0,
      0,
      70,
      '{"defaultAnonymousToRecipient": false}'::jsonb
    )
    RETURNING id INTO v_donor_id;

    INSERT INTO public.crm_command_logs (
      tenant_id,
      actor_user_id,
      actor_profile_id,
      request_id,
      action,
      resource_type,
      resource_id,
      idempotency_key,
      status,
      command_payload,
      result_summary
    )
    VALUES (
      v_ctx.tenant_id,
      v_ctx.actor_id,
      private.caller_profile_id(),
      p_request_id::TEXT,
      'missionary.partner.create',
      'donor',
      v_donor_id::TEXT,
      v_key,
      'succeeded',
      v_digest,
      pg_catalog.jsonb_build_object('donorId', v_donor_id, 'partyId', v_party_id)
    )
    RETURNING id INTO v_log_id;
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint = 'idx_crm_command_logs_tenant_idempotency' THEN
        RAISE EXCEPTION 'tenant_guard: this submission key was used for another partner'
          USING ERRCODE = '23505', HINT = 'add_partner_key';
      END IF;
      RAISE;
  END;

  RETURN pg_catalog.jsonb_build_object(
    'donorId', v_donor_id,
    'partyId', v_party_id,
    'commandLogId', v_log_id,
    'duplicate', false
  );
END;
$$;
COMMENT ON FUNCTION tenant_guard.add_partner(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) IS
  'Human command (AL-2678, WP5 rest; D-16 rulings on Add Partner; WP5 rest 2 item zero (c) and (f)): a missionary records a new partner of their own ministry, '
  'one Party and one donor owned by their worker row, named to them and preferring the phone when one was given, and one command-log row holding only the SHA-256 digest of the submission. '
  'Needs partners.add and the missionary class, held to commit; takes no e-mail; idempotent on the client''s submission key.';
RESET ROLE;
REVOKE CREATE ON SCHEMA tenant_guard FROM tenant_guard;

-- 3. Stored submissions become their digests.
-- payload digests: begin
DO $digest$
DECLARE
  v_rewritten INTEGER;
BEGIN
  UPDATE public.crm_command_logs AS l
     SET command_payload = pg_catalog.jsonb_build_object(
           'sha256',
           pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(l.command_payload::TEXT, 'UTF8')), 'hex')
         )
   WHERE l.action = 'missionary.partner.create'
     AND l.command_payload - 'sha256' <> '{}'::JSONB;
  GET DIAGNOSTICS v_rewritten = ROW_COUNT;
  RAISE NOTICE 'add_partner submissions rewritten to their digests: %', v_rewritten;
END
$digest$;
-- payload digests: end

-- 4. Hand-added partners prefer a channel they have.
-- preferred contact: begin
DO $contact$
DECLARE
  v_corrected INTEGER;
BEGIN
  WITH corrected AS (
    UPDATE public.donors AS d
       SET preferred_contact = CASE
             WHEN private.normalize_safety_text(d.phone) IS NOT NULL THEN 'phone'
           END
      FROM public.crm_command_logs AS l
     WHERE l.tenant_id = d.tenant_id
       AND l.action = 'missionary.partner.create'
       AND l.resource_type = 'donor'
       AND l.resource_id = d.id::TEXT
       AND private.normalize_safety_text(d.email) IS NULL
       AND d.preferred_contact = 'email'
    RETURNING d.tenant_id, d.id, d.preferred_contact
  )
  INSERT INTO public.audit_logs (tenant_id, action, resource_type, resource_id, details)
  SELECT c.tenant_id, 'donor_preferred_contact_corrected', 'donor', c.id::TEXT,
         pg_catalog.jsonb_build_object('migration', '20261127060100', 'from', 'email', 'to', c.preferred_contact)
    FROM corrected AS c;
  GET DIAGNOSTICS v_corrected = ROW_COUNT;
  RAISE NOTICE 'add_partner donors whose preferred contact was corrected: %', v_corrected;
END
$contact$;
-- preferred contact: end

COMMIT;

SELECT pg_notify('pgrst', 'reload schema');
