INSERT INTO public.field_policies
  (record_type, field_key, surface, tenant_id, visible, editable, exportable, sensitivity_category)
SELECT 'crm_report_groups', field_key, surface, NULL, admitted AND surface = 'mission_control',
       false, admitted AND surface = 'mission_control', category
FROM (VALUES
  ('id', 'internal', false)
, ('tenant_id', 'internal', false)
, ('label', 'contact', true)
, ('net_amount_cents', 'financial', true)
, ('gift_count', 'financial', true)
, ('donor_count', 'financial', true)
, ('last_gift_at', 'financial', true)
, ('report_complete', 'public', true)
, ('report_gift_limit', 'financial', true)
) AS fields(field_key, category, admitted)
CROSS JOIN (VALUES ('mission_control'), ('donor'), ('missionary'), ('public'), ('export')) AS surfaces(surface);
