# Mock Data & Data Migration Guide

This guide explains the mock data system used for development/demo purposes and how to replace it with your own data when deploying to production.

## Overview

The application ships with realistic mock data in `src/lib/mock-data/` for demonstration and development. When deploying your own instance, you'll replace this mock data with real data from your database.

## Mock Data Structure

```
src/lib/mock-data/
├── index.ts        # Main entry point and helper functions
├── types.ts        # TypeScript interfaces (keep for reference)
├── users.ts        # Missionaries, donors, staff profiles
├── donations.ts    # Donations, pledges, payment methods, projects
└── activities.ts   # Tasks, activities, posts, alerts, feed items
```

### Data Collections

| Collection | Description | Count |
|------------|-------------|-------|
| `MISSIONARIES` | Field worker profiles with contact info, support levels | 6 |
| `DONORS` | Donor profiles with giving history, stages | 8 |
| `STAFF` | Admin/staff member profiles | 3 |
| `DONATIONS` | Individual donation transactions | 10 |
| `PLEDGES` | Recurring giving commitments | 7 |
| `PAYMENT_METHODS` | Stored payment methods (cards, bank accounts) | 7 |
| `PROJECTS` | Ministry projects with funding goals | 6 |
| `TASKS` | Action items and follow-ups | 13 |
| `ACTIVITIES` | Activity log entries (calls, notes, meetings) | 8 |
| `POSTS` | Social feed updates and prayer requests | 7 |
| `ALERTS` | System notifications | 5 |

---

## Migration to Production

### Step 1: Set Up Database Schema

The mock data types in `types.ts` mirror the expected database schema. Create corresponding tables in Supabase:

```sql
-- Core tables (see types.ts for full field definitions)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'admin', 'staff', 'missionary', 'donor'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id),
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL, -- 'missionary', 'project', 'general_fund'
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- Add remaining tables as needed
```

### Step 2: Import Your Data

Replace mock data with database queries. Example migration pattern:

**Before (mock data):**
```typescript
// src/app/(admin)/mc/crm/page.tsx
import { DONORS, getDonorsByStage } from '@/lib/mock-data'

export default function CRMPage() {
  const activeDonors = getDonorsByStage('active')
  // ...
}
```

**After (database):**
```typescript
// src/app/(admin)/mc/crm/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function CRMPage() {
  const supabase = await createClient()
  const { data: activeDonors } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'donor')
    .eq('stage', 'active')
  // ...
}
```

### Step 3: Update Import Locations

Files that import mock data:

| File | Data Used |
|------|-----------|
| `src/app/(public)/workers/page.tsx` | `getFieldWorkers()` |
| `src/app/(public)/workers/[id]/page.tsx` | `getFieldWorkerById()` |
| `src/app/(donor)/donor-dashboard/*` | Donor transactions, pledges |
| `src/features/mission-control/care/*` | Missionary profiles, activities |
| `src/features/donor/components/*` | Worker feeds |

### Step 4: Remove Mock Data (Optional)

Once fully migrated, you can delete the mock data directory:

```bash
rm -rf src/lib/mock-data/
```

Update any remaining imports to use database queries or remove unused code.

---

## Data Import Checklist

When migrating from an existing system, import data in this order:

### 1. User Profiles
- [ ] Staff/admin accounts
- [ ] Missionary profiles (contact info, locations, ministry focus)
- [ ] Donor profiles (contact info, company, job title)

### 2. Financial Data
- [ ] Historical donations
- [ ] Active pledges/recurring gifts
- [ ] Payment methods (via Stripe migration)

### 3. Operational Data
- [ ] Tasks and follow-ups
- [ ] Activity history (calls, notes, meetings)
- [ ] CRM notes and tags

### 4. Content
- [ ] Feed posts and updates
- [ ] Photos and media (upload to Supabase Storage)
- [ ] Prayer requests

---

## Type Reference

Keep `src/lib/mock-data/types.ts` as a reference for your database schema. Key interfaces:

```typescript
// User types
interface Missionary { id, email, firstName, lastName, location, monthlyGoal, ... }
interface Donor { id, email, firstName, lastName, stage, totalGiven, ... }
interface StaffMember { id, email, firstName, lastName, role, department, ... }

// Financial types
interface Donation { id, donorId, recipientId, amount, status, date, ... }
interface Pledge { id, donorId, amount, frequency, status, ... }
interface PaymentMethodRecord { id, donorId, type, last4, ... }

// Activity types
interface Task { id, title, type, priority, status, assignedTo, dueDate, ... }
interface Activity { id, type, entityType, entityId, title, date, ... }
interface Post { id, authorId, type, title, content, likes, prayers, ... }
```

---

## Quick Start: Minimal Migration

For a fast deployment with your data:

1. **Create database tables** matching the types in `types.ts`
2. **Import core data**: profiles, donations, pledges
3. **Update 3 key files**:
   - `src/app/(public)/workers/page.tsx` - Replace `getFieldWorkers()`
   - `src/app/(donor)/donor-dashboard/page.tsx` - Replace donor data
   - `src/features/mission-control/care/constants.ts` - Replace `MOCK_PERSONNEL`
4. **Test** all dashboard routes

The remaining mock data can be migrated incrementally as you use each feature.

---

## Stripe Data Migration

Payment methods are stored in Stripe, not in the mock data. To migrate:

1. Export customers from your existing Stripe account
2. Import to your new Stripe account (or keep the same account)
3. Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`

See [Stripe Migration Guide](https://stripe.com/docs/account/data-migrations) for details.

---

## Support

- **Types reference**: `src/lib/mock-data/types.ts`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Database patterns**: `docs/technical-decisions.md`
