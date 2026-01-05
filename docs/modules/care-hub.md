# Module: Care Hub (Member Care)

The **Care Hub** is the central module within Mission Control (MC) dedicated to the health, well-being, and support of organizational personnel (missionaries, staff, and field workers).

## Overview

The Care Hub provides a 360-degree view of member health, tracking key milestones, personnel transitions, and support needs. It is designed to move member care from reactive to proactive through data-driven insights and streamlined workflows.

- **Route**: `/mc/care/*`
- **Feature Directory**: `src/features/mission-control/care/`

## Key Features

### 1. Care Dashboard (Radar)
The command center for member care. It features a "Care Radar" that surfaces personnel requiring immediate attention based on:
- Days since last contact
- Upcoming or missed milestones
- Health status changes

### 2. Personnel Directory
A comprehensive, searchable directory of all members.
- **Search & Filter**: Real-time filtering by name, role, location, or status.
- **Quick Actions**: Dropdown menus for rapid navigation to profiles, settings, or communication tools.

### 3. Member Profiles
Deep-dive views into individual member history and current status.
- **Milestones**: Tracking of significant dates (anniversaries, term starts/ends, birthdays).
- **Communication History**: Log of interactions and care touches.
- **Health Tracking**: Visual heatmaps and status indicators.

### 4. Automated Notifications
Intelligent alerts for care teams, ensuring no member "falls through the cracks" during critical transitions or long periods without contact.

## Architecture

The Care Hub follows the standard feature-based architecture of the platform, with a strong emphasis on centralized utilities for consistency and reliability.

### Directory Structure
```
src/features/mission-control/care/
├── components/           # UI components (Dashboard, List, Profile, etc.)
├── hooks/               # useCare hook for state and data fetching
├── utils.ts             # Centralized utilities (Date parsing, formatting, health logic)
├── types.ts             # TypeScript definitions for care entities
├── constants.ts         # Module-wide constants (Milestone types, status levels)
└── index.ts             # Barrel export
```

### Centralized Utilities (`utils.ts`)
To ensure consistency across the dashboard, directory, and profile views, all date manipulation and health logic is centralized:
- `parseLocalYMD(dateStr)`: Standardized parsing of YYYY-MM-DD strings to local dates, avoiding timezone offsets.
- `formatDate(date, format)`: Unified date formatting using `date-fns`.
- `getDaysSince(date)`: Calculation of elapsed time for contact tracking.
- `isOverdue(date, threshold)`: Logic for determining if a milestone or contact is past its due date.

## UI/UX Standards

The Care Hub adheres to the **Maia Theme** (Zinc Light) with the following specific patterns:
- **Info Density**: High-density data grids on desktop, optimized for staff productivity.
- **Accessibility**: Full ARIA support for complex components like the Directory dropdown.
- **Responsiveness**: Seamless transition from multi-column desktop layouts to single-column mobile views.
- **Visual Cues**: Use of semantic colors (e.g., `zinc-500` for secondary info, specific status colors for health indicators) to guide the user's attention.

## Integration

The Care Hub integrates with:
- **CRM**: Pulls core member data and contact information.
- **Tasks**: Links care touches to actionable tasks.
- **Automations**: Triggers workflows based on milestone changes.
