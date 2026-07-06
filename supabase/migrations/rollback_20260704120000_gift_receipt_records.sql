-- Reversal for 20260704120000_gift_receipt_records.sql.
-- Drops the receipt-records table and its indexes. Reversible and additive-only,
-- so rollback restores the prior schema exactly (no other objects touched).

DROP INDEX IF EXISTS public.idx_gift_receipt_records_tenant_created;
DROP INDEX IF EXISTS public.uq_gift_receipt_records_donation;
DROP TABLE IF EXISTS public.gift_receipt_records;
