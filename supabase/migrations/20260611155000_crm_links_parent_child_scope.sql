-- Parent gift vs child designation CRM record links (ADR-CD-012).
-- One parent gift link represents the donation in the CRM; designation lines
-- may post as child records. Failures stay parent- or line-scoped so retries
-- can target the failed scope.

ALTER TABLE public.donation_crm_links
    ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'parent'
        CHECK (scope IN ('parent', 'designation')),
    ADD COLUMN IF NOT EXISTS allocation_id UUID
        REFERENCES public.staged_gift_allocations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS last_error TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'donation_crm_links_designation_allocation_check'
          AND conrelid = 'public.donation_crm_links'::regclass
    ) THEN
        ALTER TABLE public.donation_crm_links
            ADD CONSTRAINT donation_crm_links_designation_allocation_check
            CHECK (scope <> 'designation' OR allocation_id IS NOT NULL);
    END IF;
END $$;

DROP INDEX IF EXISTS public.idx_donation_crm_links_donation_record;

CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_parent_record
    ON public.donation_crm_links (
        tenant_id,
        donation_id,
        crm_provider,
        twenty_object_name,
        twenty_record_id,
        scope
    )
    WHERE donation_id IS NOT NULL
      AND twenty_object_name IS NOT NULL
      AND twenty_record_id IS NOT NULL
      AND scope = 'parent';

CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_designation_record
    ON public.donation_crm_links (
        tenant_id,
        donation_id,
        allocation_id,
        crm_provider,
        twenty_object_name,
        twenty_record_id,
        scope
    )
    WHERE donation_id IS NOT NULL
      AND allocation_id IS NOT NULL
      AND twenty_object_name IS NOT NULL
      AND twenty_record_id IS NOT NULL
      AND scope = 'designation';

WITH ranked_parent_staged_gift_links AS (
    SELECT
        id,
        staged_gift_id,
        ROW_NUMBER() OVER (
            PARTITION BY tenant_id, staged_gift_id, crm_provider
            ORDER BY
                CASE link_status
                    WHEN 'active' THEN 0
                    WHEN 'queued' THEN 1
                    WHEN 'failed' THEN 2
                    WHEN 'archived' THEN 3
                    ELSE 4
                END,
                (twenty_record_id IS NOT NULL) DESC,
                updated_at DESC,
                created_at DESC,
                id
        ) AS row_rank
    FROM public.donation_crm_links
    WHERE staged_gift_id IS NOT NULL
      AND scope = 'parent'
),
duplicate_parent_staged_gift_links AS (
    SELECT id, staged_gift_id
    FROM ranked_parent_staged_gift_links
    WHERE row_rank > 1
)
UPDATE public.donation_crm_links AS duplicate
SET staged_gift_id = NULL,
    link_status = 'archived',
    last_error = CONCAT_WS(
        E'\n',
        NULLIF(duplicate.last_error, ''),
        'Archived duplicate parent staged gift link before parent staged gift singleton index.'
    ),
    metadata = duplicate.metadata || jsonb_build_object(
        'archivedByMigration',
        '20260611155000_crm_links_parent_child_scope',
        'archivedDuplicateReason',
        'duplicate_parent_staged_gift_link',
        'archivedDuplicateStagedGiftId',
        duplicate_parent_staged_gift_links.staged_gift_id::TEXT
    ),
    updated_at = NOW()
FROM duplicate_parent_staged_gift_links
WHERE duplicate.id = duplicate_parent_staged_gift_links.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_donation_crm_links_parent_staged_gift
    ON public.donation_crm_links (tenant_id, staged_gift_id, crm_provider)
    WHERE staged_gift_id IS NOT NULL
      AND scope = 'parent';

CREATE INDEX IF NOT EXISTS idx_donation_crm_links_donation_scope
    ON public.donation_crm_links (tenant_id, donation_id, scope);
