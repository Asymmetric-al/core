#!/bin/bash

# Remove unused imports from donor app
cd apps/donor

# app/checkout/checkout-client.tsx - remove Sparkles
sed -i '' '/Sparkles,/d' app/checkout/checkout-client.tsx

# app/donor-dashboard/history/page.tsx - remove AnimatePresence
sed -i '' 's/, AnimatePresence//g' app/donor-dashboard/history/page.tsx

# app/donor-dashboard/pledges/page.tsx - remove multiple unused imports
sed -i '' '/AlertCircle,/d' app/donor-dashboard/pledges/page.tsx
sed -i '' '/CheckCircle2,/d' app/donor-dashboard/pledges/page.tsx
sed -i '' '/ChevronRight,/d' app/donor-dashboard/pledges/page.tsx
sed -i '' '/ArrowRight,/d' app/donor-dashboard/pledges/page.tsx
sed -i '' '/DialogHeader,/d' app/donor-dashboard/pledges/page.tsx
sed -i '' '/DialogFooter,/d' app/donor-dashboard/pledges/page.tsx

# app/donor-dashboard/settings/page.tsx
sed -i '' '/Upload,/d' app/donor-dashboard/settings/page.tsx
sed -i '' '/^import.*X.*from "lucide-react";$/d' app/donor-dashboard/settings/page.tsx
sed -i '' '/^const Separator/d' app/donor-dashboard/settings/page.tsx

# app/donor-dashboard/wallet/page.tsx
sed -i '' '/^const Card/d' app/donor-dashboard/wallet/page.tsx
sed -i '' '/^import { formatCurrency } from/d' app/donor-dashboard/wallet/page.tsx
sed -i '' '/^const Switch/d' app/donor-dashboard/wallet/page.tsx

# app/sign/[token]/page.tsx - remove token parameter
sed -i '' 's/{ params }: { params: { token: string } }/{ params }: { params: Record<string, never> }/g' app/sign/[token]/page.tsx

# app/where-we-work/map-wrapper.tsx - remove isLoading
sed -i '' 's/const { locations, isLoading } = usePublicLocations();/const { locations } = usePublicLocations();/g' app/where-we-work/map-wrapper.tsx

# app/workers/[id]/page.tsx - remove workerTitle
sed -i '' '/const workerTitle/d' app/workers/[id]/page.tsx

# app/workers/[id]/worker-profile-client.tsx - remove worker
sed -i '' '/const worker =/d' app/workers/[id]/worker-profile-client.tsx

# app/workers/workers-client.tsx - remove cn
sed -i '' '/^import.*cn.*from/d' app/workers/workers-client.tsx

cd ../..

# Remove unused imports from missionary app
cd apps/missionary

# app/feed/page.tsx
sed -i '' 's/, formatDate//g' app/feed/page.tsx
sed -i '' '/^import { Card } from/d' app/feed/page.tsx
sed -i '' '/const scaleIn/d' app/feed/page.tsx

# app/layout.tsx - remove AppShell
sed -i '' '/import.*AppShell/d' app/layout.tsx

# app/profile/page.tsx
sed -i '' '/^import.*X.*from "lucide-react";$/d' app/profile/page.tsx
sed -i '' '/const handleAvatarUpload/,/^  };$/d' app/profile/page.tsx
sed -i '' '/const handleCoverUpload/,/^  };$/d' app/profile/page.tsx

# app/settings/page.tsx
sed -i '' '/^const Separator/d' app/settings/page.tsx
sed -i '' '/^const Badge/d' app/settings/page.tsx
sed -i '' '/Bell,/d' app/settings/page.tsx
sed -i '' '/Smartphone,/d' app/settings/page.tsx
sed -i '' '/MessageCircle,/d' app/settings/page.tsx
sed -i '' '/Heart,/d' app/settings/page.tsx
sed -i '' 's/Settings as SettingsIcon,/Settings,/g' app/settings/page.tsx
sed -i '' '/^import.*cn.*from/d' app/settings/page.tsx

# app/tasks/page.tsx
sed -i '' '/^const Badge/d' app/tasks/page.tsx
sed -i '' '/DropdownMenuItem,/d' app/tasks/page.tsx
sed -i '' '/Clock,/d' app/tasks/page.tsx

# features/missionary/components/add-partner-dialog.tsx
sed -i '' '/DialogHeader,/d' features/missionary/components/add-partner-dialog.tsx

# features/missionary/components/dashboard-home.tsx
sed -i '' '/DollarSign,/d' features/missionary/components/dashboard-home.tsx

cd ../..

echo "✓ Removed unused imports"

