# Identity email normalization

Owner: #2254 (#506 slice a). Migration:
`supabase/migrations/20261024140000_identity_email_normalizer_and_donor_keys.sql`.

One SQL function, `public.normalize_email(text)`, is the only producer of
normalized identity emails. Claim, attribution and dedupe work (#508, #509,
#510, #512, #513) keys on its output, never on a second rule.

## Function contract

```
public.normalize_email(raw text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = ''
body: NULLIF(btrim(lower(normalize(raw, NFKC)), E' \t\r\n'), '')
```

- **Order:** Unicode NFKC first, so compatibility characters fold (fullwidth
  `ＦＯＯ` becomes `FOO`, the ligature `ﬁ` becomes `fi`) and NBSP or ideographic
  spaces become U+0020 before trimming. Then lowercase, then trim space, tab, CR
  and LF. A value that is blank after trimming is NULL, so blank emails never
  collide on the key. NULL in gives NULL out (`STRICT`).
- **No** plus-tag stripping, **no** dot folding and **no** IDN/punycode
  conversion: `a+tag@x.com` and `a.b@gmail.com` keep their form.
- `pg_proc` shows `provolatile = 'i'`, `proisstrict`, `proparallel = 's'` and
  `proconfig = {search_path=""}`. Exactly one function named `normalize_email`
  exists.

### Parity fixture

The expected values come from the rule, not from an implementation. The real
stack acceptance suite checks each one, on CI Postgres 17.

| Input                                                    | Output                         |
| -------------------------------------------------------- | ------------------------------ |
| `' Foo@Bar.COM '`                                        | `foo@bar.com`                  |
| `'ＦＯＯ@ＢＡＲ.ＣＯＭ'`                                 | `foo@bar.com`                  |
| U+00A0 `a@x.com` U+3000                                  | `a@x.com`                      |
| composed `josé@x.com`, decomposed `jose` U+0301 `@x.com` | the same composed `josé@x.com` |
| `'ﬁ@x.com'`                                              | `fi@x.com`                     |
| `'A+Tag@X.com'`                                          | `a+tag@x.com`                  |
| `'A.B@Gmail.com'`                                        | `a.b@gmail.com`                |
| `'   '`                                                  | NULL                           |
| NULL                                                     | NULL                           |

### Requirements and locale limits

- `normalize(…, NFKC)` needs a **UTF8** database. The migration checks
  `pg_encoding_to_char(encoding)` for `current_database()` first and raises
  otherwise.
- `lower()` depends on the database collation. The contract is the fixture
  above on CI's settings. Characters whose lowercase depends on the locale,
  such as dotted capital `İ`, sharp `ß` and final `Σ`, are **out of contract**:
  their normalized form is whatever the database collation gives and may differ
  between environments. Do not rely on them for matching.
- Deploy check: before the production apply, confirm that the hosted
  database's `datctype` matches CI's. If it differs, escalate to Samson instead
  of applying.

## Donor columns and keys

- `donors.email_normalized` is a **generated** column,
  `GENERATED ALWAYS AS (public.normalize_email(email)) STORED`. It always equals
  `normalize_email(email)`, including after an `UPDATE` of `email`. A direct
  `INSERT` or `UPDATE` of it is rejected (SQLSTATE `428C9`).
- `donors.email_verified_at` is `timestamptz NULL` with no default and no
  trigger. It is NULL for every row after migrations and `supabase/seed.sql`.
  Nothing in `supabase/migrations/**`, `packages/**` or `apps/**` writes it.
  Only the verified-possession claim path (#509, via #508) may set it.
- `UNIQUE (tenant_id, profile_id)` (`donors_tenant_id_profile_id_key`): one
  donor per profile per tenant. The same profile may own one donor in each of
  several tenants. There is no `UNIQUE (profile_id)`.
- `donors_tenant_email_normalized_uidx`: a partial unique index on
  `(tenant_id, email_normalized) WHERE email_normalized IS NOT NULL`. A second
  donor with the same normalized email in a tenant is rejected (`' A@X.com'`
  against `'a@x.com'`, or the fullwidth form). The same email in another tenant
  is allowed, as are any number of NULL or blank emails.
- Both columns are censused as `contact` through the reviewed supplement v2
  (`docs/security/field-policies/README.md`).

### Merged donors and the email key (Q7)

There is no `donors.merged_into_donor_id`. Merge redirects stay in the
server-only `donor_merge_redirects` table, and a partial index predicate cannot
read that table. A merged donor therefore still counts against the email key.
Today no application code writes `donor_merge_redirects`, and the pre-check
below catches any existing pair. Merge execution (#512) must not leave two live
rows with the same normalized email in a tenant (for example, it clears or
rewrites the merged row's email inside the merge transaction), or it must reopen
the index design.

## Duplicate pre-check (Q10)

If existing rows would violate either key, the migration fails loudly
**before any DDL**. It raises one exception with the total group count and up to
50 groups as `(key_kind, tenant_id, donor_ids)`. The report is ids-only, with no
email text. `key_kind` is `email_normalized` or `profile_id`, the column that is
paired with `tenant_id` in the blocked key. Rows with a NULL `tenant_id` never
collide under either key, so they are not reported. Because the function does
not exist yet at that point, the pre-check inlines the same expression. A parity
assertion right after the function is created checks that the two agree on the
fixture and on every existing donor row.

Cleanup is never automatic. Nothing is merged or rewritten. Run this read-only
query, resolve each group by hand, then apply the migrations again:

```sql
SELECT 'email_normalized' AS key_kind,
       n.tenant_id,
       array_agg(n.id ORDER BY n.id) AS donor_ids
FROM (
  SELECT d.id,
         d.tenant_id,
         NULLIF(btrim(lower(normalize(d.email, NFKC)), E' \t\r\n'), '') AS email_key
  FROM public.donors d
  WHERE d.tenant_id IS NOT NULL
) n
WHERE n.email_key IS NOT NULL
GROUP BY n.tenant_id, n.email_key
HAVING count(*) > 1
UNION ALL
SELECT 'profile_id', d.tenant_id, array_agg(d.id ORDER BY d.id)
FROM public.donors d
WHERE d.tenant_id IS NOT NULL
  AND d.profile_id IS NOT NULL
GROUP BY d.tenant_id, d.profile_id
HAVING count(*) > 1
ORDER BY 1, 2, 3;
```

## Where it must be used

- Identity SQL and `packages/api/src/identity/**` compare emails only through
  `public.normalize_email` or `donors.email_normalized`. Never hand-roll
  `lower(email)`, `lower(trim(email))` or `.toLowerCase()` normalization in an
  identity path. A grep gate in the #2254 acceptance suite enforces this for new
  identity SQL and `packages/api/src/identity/**`.
- **Known gap (#508):** the guest matcher in
  `packages/api/src/donate/guest/donor-matching.ts` (`norm()`, which is
  `trim().toLowerCase()` and also used for names) is the only allowed exception.
  It is an in-memory comparator with no database key. Switching attribution to
  `email_normalized` belongs to #508.
