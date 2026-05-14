-- Refresh Supabase/PostgREST schema cache after exposing Phase 3 service-role
-- tables to the REST API surface used by server-side admin clients.
SELECT pg_notify('pgrst', 'reload schema');
