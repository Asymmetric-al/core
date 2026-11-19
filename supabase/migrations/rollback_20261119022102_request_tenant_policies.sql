-- Rollback of 20261119022102_request_tenant_policies.sql (WP2b, second release;
-- AL-2675). Run by hand, in one transaction, only to go back to the chain
-- before it; the apps of the first release keep working on either side.
--
-- Generated from the catalog of the chain with and without the migration
-- (council R10): every policy, function (definition, owner, EXECUTE grants
-- and parallel mark), relation and column privilege, trigger and publication
-- member that the migration changed, and only the privileges each relation
-- held before. Proven on a disposable database: the chain, then this file,
-- has the schema fingerprint (scripts/release/schema-fingerprint.mjs) of the
-- chain without the migration. Counts: 63 policies restored, 101 policies recreated, 6 functions restored, 1 triggers dropped, 9 functions dropped, 42 relations' privileges restored, 7 publication members restored.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL search_path = public;

-- 1. Policies: every policy as the chain before 20261119022102 held it.
DROP POLICY account_claim_requests_staff_select ON public.account_claim_requests;
CREATE POLICY account_claim_requests_staff_select ON public.account_claim_requests
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]));
DROP POLICY "tenant scoped read" ON public.assets;
CREATE POLICY "tenant scoped read" ON public.assets
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((tenant_id IS NOT NULL) AND (tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id))));
CREATE POLICY "authz staff tenant insert audit_logs" ON public.audit_logs
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
DROP POLICY "authz staff tenant select audit_logs" ON public.audit_logs;
CREATE POLICY "authz staff tenant select audit_logs" ON public.audit_logs
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
DROP POLICY "tenant scoped read" ON public.campaigns;
CREATE POLICY "tenant scoped read" ON public.campaigns
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((tenant_id IS NOT NULL) AND (tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id))));
CREATE POLICY "authz staff tenant insert crm_command_logs" ON public.crm_command_logs
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR ((auth.uid() = actor_user_id) AND authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]))));
DROP POLICY "authz staff tenant select crm_command_logs" ON public.crm_command_logs;
CREATE POLICY "authz staff tenant select crm_command_logs" ON public.crm_command_logs
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "authz staff tenant insert crm_merge_candidates" ON public.crm_merge_candidates
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "authz staff tenant select crm_merge_candidates" ON public.crm_merge_candidates;
CREATE POLICY "authz staff tenant select crm_merge_candidates" ON public.crm_merge_candidates
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "authz staff tenant update crm_merge_candidates" ON public.crm_merge_candidates
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY crm_notes_tenant_insert ON public.crm_notes;
CREATE POLICY crm_notes_tenant_insert ON public.crm_notes
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND ((visibility <> 'restricted'::text) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))));
DROP POLICY crm_notes_tenant_select ON public.crm_notes;
CREATE POLICY crm_notes_tenant_select ON public.crm_notes
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND ((visibility <> 'restricted'::text) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.user_id = ( SELECT auth.uid() AS uid)) AND (p.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))));
CREATE POLICY "authz staff tenant insert crm_record_links" ON public.crm_record_links
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "authz staff tenant select crm_record_links" ON public.crm_record_links;
CREATE POLICY "authz staff tenant select crm_record_links" ON public.crm_record_links
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "authz staff tenant update crm_record_links" ON public.crm_record_links
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "donations owner or staff select" ON public.donations;
CREATE POLICY "donations owner or staff select" ON public.donations
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id IS NOT NULL) AND ( SELECT authz.has_staff_membership(donations.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership)) OR (EXISTS ( SELECT 1
   FROM (donors d
     JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = donations.donor_id) AND ((p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid)))))) OR (EXISTS ( SELECT 1
   FROM (missionaries m
     JOIN profiles p ON ((p.id = m.profile_id)))
  WHERE ((m.id = donations.missionary_id) AND ((p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid))))))));
DROP POLICY "donor activities owner or staff select" ON public.donor_activities;
CREATE POLICY "donor activities owner or staff select" ON public.donor_activities
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR (EXISTS ( SELECT 1
   FROM (donors d
     LEFT JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = donor_activities.donor_id) AND (((d.tenant_id IS NOT NULL) AND ( SELECT authz.has_staff_membership(d.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership)) OR (p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid))))))));
DROP POLICY donor_feed_preferences_own_insert ON public.donor_feed_preferences;
CREATE POLICY donor_feed_preferences_own_insert ON public.donor_feed_preferences
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND (EXISTS ( SELECT 1
   FROM (donors d
     JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = donor_feed_preferences.donor_id) AND (d.tenant_id = donor_feed_preferences.tenant_id) AND (p.user_id = ( SELECT auth.uid() AS uid)))))));
DROP POLICY donor_feed_preferences_own_select ON public.donor_feed_preferences;
CREATE POLICY donor_feed_preferences_own_select ON public.donor_feed_preferences
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND (EXISTS ( SELECT 1
   FROM (donors d
     JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = donor_feed_preferences.donor_id) AND (d.tenant_id = donor_feed_preferences.tenant_id) AND (p.user_id = ( SELECT auth.uid() AS uid)))))));
DROP POLICY donor_feed_preferences_own_update ON public.donor_feed_preferences;
CREATE POLICY donor_feed_preferences_own_update ON public.donor_feed_preferences
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND (EXISTS ( SELECT 1
   FROM (donors d
     JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = donor_feed_preferences.donor_id) AND (d.tenant_id = donor_feed_preferences.tenant_id) AND (p.user_id = ( SELECT auth.uid() AS uid)))))))
  WITH CHECK (((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND (EXISTS ( SELECT 1
   FROM (donors d
     JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = donor_feed_preferences.donor_id) AND (d.tenant_id = donor_feed_preferences.tenant_id) AND (p.user_id = ( SELECT auth.uid() AS uid)))))));
DROP POLICY "donor pledges owner or staff select" ON public.donor_pledges;
CREATE POLICY "donor pledges owner or staff select" ON public.donor_pledges
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id IS NOT NULL) AND ( SELECT authz.has_staff_membership(donor_pledges.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership)) OR (EXISTS ( SELECT 1
   FROM (donors d
     JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = donor_pledges.donor_id) AND ((p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid)))))) OR (EXISTS ( SELECT 1
   FROM (missionaries m
     JOIN profiles p ON ((p.id = m.profile_id)))
  WHERE ((m.id = donor_pledges.missionary_id) AND ((p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid))))))));
DROP POLICY "donors owner or staff select" ON public.donors;
CREATE POLICY "donors owner or staff select" ON public.donors
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id IS NOT NULL) AND ( SELECT authz.has_staff_membership(donors.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership)) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = donors.profile_id) AND ((p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid))))))));
DROP POLICY field_policies_read ON public.field_policies;
CREATE POLICY field_policies_read ON public.field_policies
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR (((tenant_id IS NULL) OR (tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id))) AND ( SELECT authz.has_membership(authz.current_tenant_id()) AS has_membership))));
CREATE POLICY field_policies_super_admin_delete ON public.field_policies
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (( SELECT authz.is_super_admin() AS is_super_admin));
CREATE POLICY field_policies_super_admin_insert ON public.field_policies
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (( SELECT authz.is_super_admin() AS is_super_admin));
CREATE POLICY field_policies_super_admin_update ON public.field_policies
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (( SELECT authz.is_super_admin() AS is_super_admin))
  WITH CHECK (( SELECT authz.is_super_admin() AS is_super_admin));
DROP POLICY "tenant scoped own or staff read" ON public.follows;
CREATE POLICY "tenant scoped own or staff read" ON public.follows
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((tenant_id IS NOT NULL) AND (tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ((EXISTS ( SELECT 1
   FROM (donors d
     JOIN profiles p ON ((p.id = d.profile_id)))
  WHERE ((d.id = follows.donor_id) AND (d.tenant_id = follows.tenant_id) AND ((p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid)))))) OR ( SELECT authz.has_staff_membership(follows.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "tenant scoped read" ON public.funds;
CREATE POLICY "tenant scoped read" ON public.funds
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((tenant_id IS NOT NULL) AND (tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id))));
DROP POLICY legacy_account_invitations_staff_select ON public.legacy_account_invitations;
CREATE POLICY legacy_account_invitations_staff_select ON public.legacy_account_invitations
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]));
CREATE POLICY "member care activities delete" ON public.member_care_activities
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((authz.is_super_admin() OR (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND (auth.uid() = author_user_id))));
CREATE POLICY "member care activities insert" ON public.member_care_activities
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])) AND (auth.uid() IS NOT NULL) AND (auth.uid() = author_user_id)));
DROP POLICY "member care activities select" ON public.member_care_activities;
CREATE POLICY "member care activities select" ON public.member_care_activities
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "member care activities update" ON public.member_care_activities
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND (auth.uid() = author_user_id))))
  WITH CHECK ((authz.is_super_admin() OR (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND (auth.uid() = author_user_id))));
CREATE POLICY "member care goals delete" ON public.member_care_goals
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "member care goals insert" ON public.member_care_goals
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND (auth.uid() IS NOT NULL) AND (updated_by = auth.uid()))));
DROP POLICY "member care goals select" ON public.member_care_goals;
CREATE POLICY "member care goals select" ON public.member_care_goals
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "member care goals update" ON public.member_care_goals
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND (auth.uid() IS NOT NULL) AND (updated_by = auth.uid()))));
CREATE POLICY "member care private notes delete" ON public.member_care_private_notes
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((authz.is_super_admin() OR (auth.uid() = author_user_id)));
CREATE POLICY "member care private notes insert" ON public.member_care_private_notes
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (((auth.uid() IS NOT NULL) AND (auth.uid() = author_user_id) AND (authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]))));
DROP POLICY "member care private notes select" ON public.member_care_private_notes;
CREATE POLICY "member care private notes select" ON public.member_care_private_notes
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR (auth.uid() = author_user_id)));
CREATE POLICY "member care private notes update" ON public.member_care_private_notes
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR (auth.uid() = author_user_id)))
  WITH CHECK ((authz.is_super_admin() OR (auth.uid() = author_user_id)));
CREATE POLICY "member care requirements delete" ON public.member_care_requirements
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "member care requirements insert" ON public.member_care_requirements
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND (auth.uid() IS NOT NULL) AND (updated_by = auth.uid()))));
DROP POLICY "member care requirements select" ON public.member_care_requirements;
CREATE POLICY "member care requirements select" ON public.member_care_requirements
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "member care requirements update" ON public.member_care_requirements
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]) AND (auth.uid() IS NOT NULL) AND (updated_by = auth.uid()))));
DROP POLICY "missionaries own row key read" ON public.missionaries;
CREATE POLICY "missionaries own row key read" ON public.missionaries
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = missionaries.profile_id) AND ((p.user_id = ( SELECT auth.uid() AS uid)) OR (p.id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "authz staff tenant delete notification_queue" ON public.notification_queue
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
CREATE POLICY "authz staff tenant insert notification_queue" ON public.notification_queue
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
DROP POLICY "authz staff tenant select notification_queue" ON public.notification_queue;
CREATE POLICY "authz staff tenant select notification_queue" ON public.notification_queue
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
CREATE POLICY "authz staff tenant update notification_queue" ON public.notification_queue
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()))
  WITH CHECK ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
CREATE POLICY "pdf template artifacts insert" ON public.pdf_template_artifacts
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "pdf template artifacts select" ON public.pdf_template_artifacts;
CREATE POLICY "pdf template artifacts select" ON public.pdf_template_artifacts
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template audit events insert" ON public.pdf_template_audit_events
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "pdf template audit events select" ON public.pdf_template_audit_events;
CREATE POLICY "pdf template audit events select" ON public.pdf_template_audit_events
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template batch jobs insert" ON public.pdf_template_batch_jobs
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "pdf template batch jobs select" ON public.pdf_template_batch_jobs;
CREATE POLICY "pdf template batch jobs select" ON public.pdf_template_batch_jobs
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template batch jobs update" ON public.pdf_template_batch_jobs
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template batches insert" ON public.pdf_template_batches
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "pdf template batches select" ON public.pdf_template_batches;
CREATE POLICY "pdf template batches select" ON public.pdf_template_batches
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template batches update" ON public.pdf_template_batches
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template renders insert" ON public.pdf_template_renders
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "pdf template renders select" ON public.pdf_template_renders;
CREATE POLICY "pdf template renders select" ON public.pdf_template_renders
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template renders update" ON public.pdf_template_renders
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template versions insert" ON public.pdf_template_versions
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "pdf template versions select" ON public.pdf_template_versions;
CREATE POLICY "pdf template versions select" ON public.pdf_template_versions
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "pdf template versions update" ON public.pdf_template_versions
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "authz staff tenant delete pdf_templates" ON public.pdf_templates
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
CREATE POLICY "authz staff tenant insert pdf_templates" ON public.pdf_templates
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
DROP POLICY "authz staff tenant select pdf_templates" ON public.pdf_templates;
CREATE POLICY "authz staff tenant select pdf_templates" ON public.pdf_templates
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
CREATE POLICY "authz staff tenant update pdf_templates" ON public.pdf_templates
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()))
  WITH CHECK ((((tenant_id IS NOT NULL) AND authz.has_membership(tenant_id, ARRAY['staff'::authz.membership_role])) OR authz.is_super_admin()));
DROP POLICY persons_staff_select ON public.persons;
CREATE POLICY persons_staff_select ON public.persons
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (authz.has_staff_membership(tenant_id, NULL::authz.staff_role[]));
CREATE POLICY "profiles staff tenant select" ON public.profiles
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id IS NOT NULL) AND ( SELECT authz.has_staff_membership(profiles.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_agents
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_agents.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_agents
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_agents.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_agents;
CREATE POLICY "support hub staff select" ON public.support_agents
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_agents.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_agents
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_agents.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_agents.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_assignments
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_assignments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_assignments
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_assignments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_assignments;
CREATE POLICY "support hub staff select" ON public.support_assignments
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_assignments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_assignments
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_assignments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_assignments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_audit_log
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_audit_log.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_audit_log
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_audit_log.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_audit_log;
CREATE POLICY "support hub staff select" ON public.support_audit_log
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_audit_log.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_audit_log
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_audit_log.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_audit_log.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_automation_rules
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_automation_rules.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_automation_rules
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_automation_rules.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_automation_rules;
CREATE POLICY "support hub staff select" ON public.support_automation_rules
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_automation_rules.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_automation_rules
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_automation_rules.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_automation_rules.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_business_hours
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_business_hours.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_business_hours
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_business_hours.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_business_hours;
CREATE POLICY "support hub staff select" ON public.support_business_hours
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_business_hours.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_business_hours
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_business_hours.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_business_hours.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_canned_responses
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_canned_responses.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_canned_responses
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_canned_responses.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_canned_responses;
CREATE POLICY "support hub staff select" ON public.support_canned_responses
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_canned_responses.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_canned_responses
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_canned_responses.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_canned_responses.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support contacts delete" ON public.support_contacts
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "support contacts insert" ON public.support_contacts
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "support contacts select" ON public.support_contacts;
CREATE POLICY "support contacts select" ON public.support_contacts
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "support contacts update" ON public.support_contacts
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "support hub staff delete" ON public.support_conversation_labels
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversation_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_conversation_labels
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversation_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_conversation_labels;
CREATE POLICY "support hub staff select" ON public.support_conversation_labels
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversation_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_conversation_labels
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversation_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversation_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_conversations
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversations.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_conversations
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversations.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_conversations;
CREATE POLICY "support hub staff select" ON public.support_conversations
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversations.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_conversations
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversations.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_conversations.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_inbox_settings
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inbox_settings.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_inbox_settings
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inbox_settings.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_inbox_settings;
CREATE POLICY "support hub staff select" ON public.support_inbox_settings
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inbox_settings.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_inbox_settings
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inbox_settings.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inbox_settings.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_inboxes
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inboxes.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_inboxes
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inboxes.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_inboxes;
CREATE POLICY "support hub staff select" ON public.support_inboxes
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inboxes.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_inboxes
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inboxes.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_inboxes.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_labels
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_labels
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_labels;
CREATE POLICY "support hub staff select" ON public.support_labels
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_labels
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_labels.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_macros
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_macros.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_macros
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_macros.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_macros;
CREATE POLICY "support hub staff select" ON public.support_macros
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_macros.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_macros
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_macros.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_macros.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_message_attachments
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_message_attachments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_message_attachments
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_message_attachments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_message_attachments;
CREATE POLICY "support hub staff select" ON public.support_message_attachments
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_message_attachments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_message_attachments
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_message_attachments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_message_attachments.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_messages
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_messages.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_messages
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_messages.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_messages;
CREATE POLICY "support hub staff select" ON public.support_messages
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_messages.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_messages
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_messages.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_messages.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_notification_preferences
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_notification_preferences.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_notification_preferences
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_notification_preferences.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_notification_preferences;
CREATE POLICY "support hub staff select" ON public.support_notification_preferences
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_notification_preferences.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_notification_preferences
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_notification_preferences.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_notification_preferences.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_saved_views
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_saved_views.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_saved_views
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_saved_views.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_saved_views;
CREATE POLICY "support hub staff select" ON public.support_saved_views
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_saved_views.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_saved_views
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_saved_views.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_saved_views.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_signatures
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_signatures.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_signatures
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_signatures.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_signatures;
CREATE POLICY "support hub staff select" ON public.support_signatures
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_signatures.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_signatures
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_signatures.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_signatures.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_sla_policies
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_sla_policies.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_sla_policies
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_sla_policies.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_sla_policies;
CREATE POLICY "support hub staff select" ON public.support_sla_policies
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_sla_policies.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_sla_policies
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_sla_policies.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_sla_policies.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff delete" ON public.support_teams
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_teams.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff insert" ON public.support_teams
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_teams.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
DROP POLICY "support hub staff select" ON public.support_teams;
CREATE POLICY "support hub staff select" ON public.support_teams
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_teams.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support hub staff update" ON public.support_teams
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_teams.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))))
  WITH CHECK ((( SELECT authz.is_super_admin() AS is_super_admin) OR ((tenant_id = ( SELECT authz.current_tenant_id() AS current_tenant_id)) AND ( SELECT authz.has_staff_membership(support_teams.tenant_id, NULL::authz.staff_role[]) AS has_staff_membership))));
CREATE POLICY "support tickets delete" ON public.support_tickets
  AS PERMISSIVE FOR DELETE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "support tickets insert" ON public.support_tickets
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])) AND (auth.uid() IS NOT NULL) AND (created_by = auth.uid())));
DROP POLICY "support tickets select" ON public.support_tickets;
CREATE POLICY "support tickets select" ON public.support_tickets
  AS PERMISSIVE FOR SELECT TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
CREATE POLICY "support tickets update" ON public.support_tickets
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])))
  WITH CHECK ((authz.is_super_admin() OR authz.has_staff_membership(tenant_id, NULL::authz.staff_role[])));
DROP POLICY "Owner delete document-uploads" ON storage.objects;
CREATE POLICY "Owner delete document-uploads" ON storage.objects
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (((bucket_id = 'document-uploads'::text) AND (auth.uid() = owner)));
DROP POLICY "Owner delete profiles" ON storage.objects;
CREATE POLICY "Owner delete profiles" ON storage.objects
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (((bucket_id = 'profiles'::text) AND (auth.uid() = owner)));
DROP POLICY "editor images owner folder insert" ON storage.objects;
CREATE POLICY "editor images owner folder insert" ON storage.objects
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (((bucket_id = 'document-uploads'::text) AND ((string_to_array(name, '/'::text))[1] = 'editor'::text) AND ((string_to_array(name, '/'::text))[2] IN ( SELECT COALESCE((p.tenant_id)::text,
        CASE
            WHEN (p.role = 'super_admin'::text) THEN '00000000-0000-0000-0000-000000000001'::text
            ELSE NULL::text
        END) AS "coalesce"
   FROM profiles p
  WHERE (p.user_id = ( SELECT auth.uid() AS uid)))) AND ((string_to_array(name, '/'::text))[3] = (( SELECT auth.uid() AS uid))::text) AND ((string_to_array(name, '/'::text))[4] <> ''::text)));
DROP POLICY "editor images owner folder update" ON storage.objects;
CREATE POLICY "editor images owner folder update" ON storage.objects
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (((bucket_id = 'document-uploads'::text) AND (owner = ( SELECT auth.uid() AS uid))))
  WITH CHECK (((bucket_id = 'document-uploads'::text) AND (owner = ( SELECT auth.uid() AS uid)) AND ((string_to_array(name, '/'::text))[1] = 'editor'::text) AND ((string_to_array(name, '/'::text))[2] IN ( SELECT COALESCE((p.tenant_id)::text,
        CASE
            WHEN (p.role = 'super_admin'::text) THEN '00000000-0000-0000-0000-000000000001'::text
            ELSE NULL::text
        END) AS "coalesce"
   FROM profiles p
  WHERE (p.user_id = ( SELECT auth.uid() AS uid)))) AND ((string_to_array(name, '/'::text))[3] = (( SELECT auth.uid() AS uid))::text) AND ((string_to_array(name, '/'::text))[4] <> ''::text)));
DROP POLICY "editor images owner select" ON storage.objects;
CREATE POLICY "editor images owner select" ON storage.objects
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((bucket_id = 'document-uploads'::text) AND (owner = ( SELECT auth.uid() AS uid))));
DROP POLICY "profiles owner folder insert" ON storage.objects;
CREATE POLICY "profiles owner folder insert" ON storage.objects
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (((bucket_id = 'profiles'::text) AND ((string_to_array(name, '/'::text))[1] = ANY (ARRAY['avatars'::text, 'covers'::text])) AND ((string_to_array(name, '/'::text))[2] IN ( SELECT COALESCE((p.tenant_id)::text,
        CASE
            WHEN (p.role = 'super_admin'::text) THEN '00000000-0000-0000-0000-000000000001'::text
            ELSE NULL::text
        END) AS "coalesce"
   FROM profiles p
  WHERE (p.user_id = ( SELECT auth.uid() AS uid)))) AND ((string_to_array(name, '/'::text))[3] = (( SELECT auth.uid() AS uid))::text) AND ((string_to_array(name, '/'::text))[4] <> ''::text)));
DROP POLICY "profiles owner folder update" ON storage.objects;
CREATE POLICY "profiles owner folder update" ON storage.objects
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (((bucket_id = 'profiles'::text) AND (owner = ( SELECT auth.uid() AS uid))))
  WITH CHECK (((bucket_id = 'profiles'::text) AND (owner = ( SELECT auth.uid() AS uid)) AND ((string_to_array(name, '/'::text))[1] = ANY (ARRAY['avatars'::text, 'covers'::text])) AND ((string_to_array(name, '/'::text))[2] IN ( SELECT COALESCE((p.tenant_id)::text,
        CASE
            WHEN (p.role = 'super_admin'::text) THEN '00000000-0000-0000-0000-000000000001'::text
            ELSE NULL::text
        END) AS "coalesce"
   FROM profiles p
  WHERE (p.user_id = ( SELECT auth.uid() AS uid)))) AND ((string_to_array(name, '/'::text))[3] = (( SELECT auth.uid() AS uid))::text) AND ((string_to_array(name, '/'::text))[4] <> ''::text)));
DROP POLICY "profiles owner select" ON storage.objects;
CREATE POLICY "profiles owner select" ON storage.objects
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (((bucket_id = 'profiles'::text) AND (owner = ( SELECT auth.uid() AS uid))));

-- 2. Functions both chains define, as the chain before held them.
CREATE OR REPLACE FUNCTION authz.caller_assignment(p_tenant_id uuid, p_role authz.membership_role)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
DECLARE
  v_user UUID := auth.uid();
  v_named UUID := tenant_guard.request_assignment_id();
  v_rows UUID[];
BEGIN
  IF v_user IS NULL OR p_tenant_id IS NULL OR p_role IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT pg_catalog.array_agg(m.id)
    INTO v_rows
    FROM authz.memberships AS m
   WHERE m.user_id = v_user
     AND m.tenant_id = p_tenant_id
     AND m.role = p_role
     AND m.is_active
     AND m.revoked_at IS NULL
     AND (v_named IS NULL OR m.id = v_named);

  IF pg_catalog.cardinality(v_rows) = 1 THEN
    RETURN v_rows[1];
  END IF;
  RETURN NULL;
END;
$function$;
CREATE OR REPLACE FUNCTION authz.current_tenant_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT CASE
    WHEN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    THEN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    ELSE NULL
  END;
$function$;
CREATE OR REPLACE FUNCTION authz.current_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT auth.uid();
$function$;
CREATE OR REPLACE FUNCTION authz.has_membership(target_tenant uuid, required_roles authz.membership_role[] DEFAULT NULL::authz.membership_role[])
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'authz'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM authz.memberships m
    WHERE m.user_id = auth.uid()
      AND m.tenant_id = target_tenant
      AND m.is_active = true
      AND (
        required_roles IS NULL
        OR m.role = ANY(required_roles)
      )
  );
$function$;
CREATE OR REPLACE FUNCTION authz.has_staff_membership(target_tenant uuid, required_staff_roles authz.staff_role[] DEFAULT NULL::authz.staff_role[])
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'authz'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM authz.memberships m
    WHERE m.user_id = auth.uid()
      AND m.tenant_id = target_tenant
      AND m.role = 'staff'
      AND m.is_active = true
      AND (
        required_staff_roles IS NULL
        OR m.staff_role = ANY(required_staff_roles)
      )
  );
$function$;
CREATE OR REPLACE FUNCTION authz.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'super_admin'
  );
$function$;

-- 3. Triggers.
DROP TRIGGER crm_notes_stamp_signed_in_author ON public.crm_notes;

-- 4. Functions this migration added.
DROP FUNCTION authz.assignment_holds(text);
DROP FUNCTION authz.assignment_is(authz.membership_role,authz.staff_role[]);
DROP FUNCTION authz.assignment_is_tenant_admin();
DROP FUNCTION authz.caller_profile_ids();
DROP FUNCTION authz.caller_tenant_ids();
DROP FUNCTION authz.request_assignment();
DROP FUNCTION authz.request_assignment_id();
DROP FUNCTION authz.request_tenant_id();
DROP FUNCTION crm_notes_stamp_signed_in_author();

-- 5. Privileges, as each relation and column held them before.
GRANT INSERT ON TABLE public.audit_logs TO authenticated;
GRANT INSERT ON TABLE public.crm_command_logs TO authenticated;
GRANT INSERT ON TABLE public.crm_merge_candidates TO authenticated;
GRANT UPDATE ON TABLE public.crm_merge_candidates TO authenticated;
GRANT INSERT ON TABLE public.donation_crm_links TO authenticated;
GRANT UPDATE ON TABLE public.donation_crm_links TO authenticated;
GRANT INSERT ON TABLE public.field_policies TO authenticated;
GRANT UPDATE ON TABLE public.field_policies TO authenticated;
GRANT DELETE ON TABLE public.field_policies TO authenticated;
GRANT INSERT ON TABLE public.giving_reconciliation_runs TO authenticated;
GRANT UPDATE ON TABLE public.giving_reconciliation_runs TO authenticated;
GRANT INSERT ON TABLE public.member_care_activities TO authenticated;
GRANT UPDATE ON TABLE public.member_care_activities TO authenticated;
GRANT DELETE ON TABLE public.member_care_activities TO authenticated;
GRANT INSERT ON TABLE public.member_care_goals TO authenticated;
GRANT UPDATE ON TABLE public.member_care_goals TO authenticated;
GRANT DELETE ON TABLE public.member_care_goals TO authenticated;
GRANT INSERT ON TABLE public.member_care_private_notes TO authenticated;
GRANT UPDATE ON TABLE public.member_care_private_notes TO authenticated;
GRANT DELETE ON TABLE public.member_care_private_notes TO authenticated;
GRANT INSERT ON TABLE public.member_care_requirements TO authenticated;
GRANT UPDATE ON TABLE public.member_care_requirements TO authenticated;
GRANT DELETE ON TABLE public.member_care_requirements TO authenticated;
GRANT INSERT ON TABLE public.notification_queue TO authenticated;
GRANT UPDATE ON TABLE public.notification_queue TO authenticated;
GRANT DELETE ON TABLE public.notification_queue TO authenticated;
GRANT INSERT ON TABLE public.pdf_template_artifacts TO authenticated;
GRANT INSERT ON TABLE public.pdf_template_audit_events TO authenticated;
GRANT INSERT ON TABLE public.pdf_template_batch_jobs TO authenticated;
GRANT UPDATE ON TABLE public.pdf_template_batch_jobs TO authenticated;
GRANT INSERT ON TABLE public.pdf_template_batches TO authenticated;
GRANT UPDATE ON TABLE public.pdf_template_batches TO authenticated;
GRANT INSERT ON TABLE public.pdf_template_renders TO authenticated;
GRANT UPDATE ON TABLE public.pdf_template_renders TO authenticated;
GRANT INSERT ON TABLE public.pdf_template_versions TO authenticated;
GRANT UPDATE ON TABLE public.pdf_template_versions TO authenticated;
GRANT INSERT ON TABLE public.staged_gift_allocations TO authenticated;
GRANT UPDATE ON TABLE public.staged_gift_allocations TO authenticated;
GRANT DELETE ON TABLE public.staged_gift_allocations TO authenticated;
GRANT INSERT ON TABLE public.staged_gift_audit_events TO authenticated;
GRANT INSERT ON TABLE public.staged_gifts TO authenticated;
GRANT UPDATE ON TABLE public.staged_gifts TO authenticated;
GRANT INSERT ON TABLE public.stripe_raw_events TO authenticated;
GRANT UPDATE ON TABLE public.stripe_raw_events TO authenticated;
GRANT INSERT ON TABLE public.support_agents TO authenticated;
GRANT UPDATE ON TABLE public.support_agents TO authenticated;
GRANT DELETE ON TABLE public.support_agents TO authenticated;
GRANT INSERT ON TABLE public.support_assignments TO authenticated;
GRANT UPDATE ON TABLE public.support_assignments TO authenticated;
GRANT DELETE ON TABLE public.support_assignments TO authenticated;
GRANT INSERT ON TABLE public.support_audit_log TO authenticated;
GRANT UPDATE ON TABLE public.support_audit_log TO authenticated;
GRANT DELETE ON TABLE public.support_audit_log TO authenticated;
GRANT INSERT ON TABLE public.support_automation_rules TO authenticated;
GRANT UPDATE ON TABLE public.support_automation_rules TO authenticated;
GRANT DELETE ON TABLE public.support_automation_rules TO authenticated;
GRANT INSERT ON TABLE public.support_business_hours TO authenticated;
GRANT UPDATE ON TABLE public.support_business_hours TO authenticated;
GRANT DELETE ON TABLE public.support_business_hours TO authenticated;
GRANT INSERT ON TABLE public.support_canned_responses TO authenticated;
GRANT UPDATE ON TABLE public.support_canned_responses TO authenticated;
GRANT DELETE ON TABLE public.support_canned_responses TO authenticated;
GRANT INSERT ON TABLE public.support_contacts TO authenticated;
GRANT UPDATE ON TABLE public.support_contacts TO authenticated;
GRANT DELETE ON TABLE public.support_contacts TO authenticated;
GRANT INSERT ON TABLE public.support_conversation_labels TO authenticated;
GRANT UPDATE ON TABLE public.support_conversation_labels TO authenticated;
GRANT DELETE ON TABLE public.support_conversation_labels TO authenticated;
GRANT INSERT ON TABLE public.support_conversations TO authenticated;
GRANT UPDATE ON TABLE public.support_conversations TO authenticated;
GRANT DELETE ON TABLE public.support_conversations TO authenticated;
GRANT INSERT ON TABLE public.support_inbox_settings TO authenticated;
GRANT UPDATE ON TABLE public.support_inbox_settings TO authenticated;
GRANT DELETE ON TABLE public.support_inbox_settings TO authenticated;
GRANT INSERT ON TABLE public.support_inboxes TO authenticated;
GRANT UPDATE ON TABLE public.support_inboxes TO authenticated;
GRANT DELETE ON TABLE public.support_inboxes TO authenticated;
GRANT INSERT ON TABLE public.support_labels TO authenticated;
GRANT UPDATE ON TABLE public.support_labels TO authenticated;
GRANT DELETE ON TABLE public.support_labels TO authenticated;
GRANT INSERT ON TABLE public.support_macros TO authenticated;
GRANT UPDATE ON TABLE public.support_macros TO authenticated;
GRANT DELETE ON TABLE public.support_macros TO authenticated;
GRANT INSERT ON TABLE public.support_message_attachments TO authenticated;
GRANT UPDATE ON TABLE public.support_message_attachments TO authenticated;
GRANT DELETE ON TABLE public.support_message_attachments TO authenticated;
GRANT INSERT ON TABLE public.support_messages TO authenticated;
GRANT UPDATE ON TABLE public.support_messages TO authenticated;
GRANT DELETE ON TABLE public.support_messages TO authenticated;
GRANT INSERT ON TABLE public.support_notification_preferences TO authenticated;
GRANT UPDATE ON TABLE public.support_notification_preferences TO authenticated;
GRANT DELETE ON TABLE public.support_notification_preferences TO authenticated;
GRANT INSERT ON TABLE public.support_saved_views TO authenticated;
GRANT UPDATE ON TABLE public.support_saved_views TO authenticated;
GRANT DELETE ON TABLE public.support_saved_views TO authenticated;
GRANT INSERT ON TABLE public.support_signatures TO authenticated;
GRANT UPDATE ON TABLE public.support_signatures TO authenticated;
GRANT DELETE ON TABLE public.support_signatures TO authenticated;
GRANT INSERT ON TABLE public.support_sla_policies TO authenticated;
GRANT UPDATE ON TABLE public.support_sla_policies TO authenticated;
GRANT DELETE ON TABLE public.support_sla_policies TO authenticated;
GRANT INSERT ON TABLE public.support_teams TO authenticated;
GRANT UPDATE ON TABLE public.support_teams TO authenticated;
GRANT DELETE ON TABLE public.support_teams TO authenticated;
GRANT INSERT ON TABLE public.support_tickets TO authenticated;
GRANT UPDATE ON TABLE public.support_tickets TO authenticated;
GRANT DELETE ON TABLE public.support_tickets TO authenticated;

-- 6. Publication members.
ALTER PUBLICATION supabase_realtime ADD TABLE public.funds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_fires;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_prayers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

COMMIT;
