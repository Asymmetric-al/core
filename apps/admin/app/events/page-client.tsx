"use client";

import { useEventAttendees } from "@asym/database/hooks";
import { motion } from "@asym/lib/motion";
import { formatCurrency, getInitials } from "@asym/lib/utils";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@asym/ui/components/shadcn/card";
import { DataTableColumnHeader } from "@asym/ui/components/shadcn/data-table";
import { DataTableWrapper } from "@asym/ui/components/shadcn/data-table/data-table-wrapper";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Progress } from "@asym/ui/components/shadcn/progress";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Users,
  DollarSign,
  Plus,
  Search,
  MoreHorizontal,
  ChevronDown,
  Printer,
  FileText,
  Settings,
  Download,
  ScanLine,
  Mail,
  UserPlus,
  User,
  Layers,
  Eye,
  Presentation,
  Timer,
  Building,
  Wifi,
  BedDouble,
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useState } from "react";

import { deriveRegistrationCapacity } from "./events-derived";

// --- Types & Mock Data ---

type EventStatus = "Draft" | "Published" | "Live" | "Completed";
type SpeakerStatus = "Confirmed" | "Invited" | "Pending" | "Declined";

interface Track {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  locationDescription?: string; // e.g. "2nd Floor, West Wing"
}

interface Venue {
  id: string;
  name: string;
  type: "Primary" | "Secondary" | "Off-site";
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website?: string;
  mapLink?: string;
  directions?: string;
  capacity?: number;
  rooms: Room[];
}

interface Hotel {
  id: string;
  name: string;
  address: string;
  website?: string;
  bookingLink?: string;
  distanceLabel?: string; // e.g. "0.5 miles from venue"
  contractedRate?: string;
  roomBlockTotal?: number;
  roomBlockFilled?: number;
  amenities?: string[];
  notes?: string;
}

interface LocalAmenity {
  id: string;
  name: string;
  type: "Restaurant" | "Coffee" | "Attraction" | "Transport";
  address?: string;
  description?: string;
  link?: string;
}

interface TransportOption {
  type: "Airport" | "Train" | "Parking" | "Shuttle";
  name: string;
  details: string;
  link?: string;
}

interface Logistics {
  wifiSsid?: string;
  wifiPass?: string;
  timezone?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
  transportOptions?: TransportOption[];
  localAmenities?: LocalAmenity[];
}

interface SessionType {
  id: string;
  name: string; // e.g. "Keynote", "Workshop", "Panel"
  icon?: string;
  color?: string;
}

interface ConferenceEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  status: EventStatus;
  registrants: number;
  capacity: number;
  revenue: number;
  image: string;
  fundCode: string;
  goalRevenue?: number;
  speakers?: string[];

  // Event Specific Configuration
  venues: Venue[];
  hotels: Hotel[];
  logistics: Logistics;

  tracks: Track[];
  sessionTypes: SessionType[];
  sessions: Session[];
}

interface Speaker {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  company: string;
  bio: string;
  avatar: string;
  status: SpeakerStatus;
  linkedin?: string;
  twitter?: string;
  website?: string;
  sessions?: string[]; // IDs of sessions
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ticketType: string;
  status: "Registered" | "Checked In" | "Cancelled" | "Waitlist";
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Due";
  checkInTime?: string;
  organization?: string;
  jobTitle?: string;
  registrationDate: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  tshirtSize?: string;
  notes?: string;
  assignedSessions: string[];
  assignedHotelId?: string; // Link to Hotel
  assignedRoomNumber?: string; // Specific room
  avatar?: string;
  isVip?: boolean;
}

interface Session {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO Date YYYY-MM-DD
  startTime: string; // HH:MM 24h
  endTime: string; // HH:MM 24h
  venueId: string; // Link to Venue
  roomId: string; // Link to Room within Venue
  speakerIds: string[];
  trackId: string;
  typeId: string;
  capacity?: number;
  isPublished: boolean;
}

// --- Form Builder Types ---

type FormFieldType =
  | "text"
  | "email"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "textarea"
  | "ranking"
  | "repeater";

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, ranking
  crmField?: string; // CRM mapping key
  helpText?: string;
  subFields?: FormField[]; // For repeater groups
}

const _DEFAULT_FORM_FIELDS: FormField[] = [
  {
    id: "f1",
    type: "text",
    label: "First Name",
    required: true,
    crmField: "contact.firstName",
  },
  {
    id: "f2",
    type: "text",
    label: "Last Name",
    required: true,
    crmField: "contact.lastName",
  },
  {
    id: "f3",
    type: "email",
    label: "Email Address",
    required: true,
    crmField: "contact.email",
  },
  {
    id: "f4",
    type: "date",
    label: "Date of Birth",
    required: true,
    crmField: "contact.dob",
  },
  {
    id: "f5",
    type: "textarea",
    label: "Food Allergies or Dietary Restrictions",
    required: false,
    crmField: "attendee.dietary",
  },
  {
    id: "f6",
    type: "file",
    label: "Upload Passport Photo",
    required: true,
    helpText: "Upload 1 supported file: PDF, document, or image. Max 100 MB.",
    crmField: "attendee.documents.passport",
  },
  {
    id: "f7",
    type: "select",
    label: "T-Shirt Size",
    required: true,
    options: ["XS", "S", "M", "L", "XL", "XXL"],
    crmField: "attendee.swag.shirtSize",
  },
];

const MOCK_VENUES: Venue[] = [
  {
    id: "ven-1",
    name: "Denver Convention Center",
    type: "Primary",
    address: "700 14th St",
    city: "Denver",
    state: "CO",
    zip: "80202",
    country: "USA",
    website: "https://denverconvention.com",
    mapLink: "https://maps.google.com",
    directions:
      "Take the train from DIA to Union Station. Light rail stops directly in front of the venue at the Theatre District/Convention Center station.",
    capacity: 5000,
    rooms: [
      {
        id: "rm-1",
        name: "Grand Ballroom",
        capacity: 1000,
        locationDescription: "Level 1, Main Entrance",
      },
      {
        id: "rm-2",
        name: "Breakout A",
        capacity: 50,
        locationDescription: "Level 2, East Wing",
      },
      {
        id: "rm-3",
        name: "Breakout B",
        capacity: 50,
        locationDescription: "Level 2, West Wing",
      },
    ],
  },
];

const MOCK_HOTELS: Hotel[] = [
  {
    id: "hot-1",
    name: "Hyatt Regency Denver",
    address: "650 15th St, Denver, CO",
    website: "https://hyatt.com",
    bookingLink: "https://hyatt.com/group-booking/givehope25",
    distanceLabel: "Across the street",
    contractedRate: "$189/night",
    roomBlockTotal: 200,
    roomBlockFilled: 145,
    amenities: ["Free Wifi", "Gym", "Pool"],
    notes: "Primary staff hotel",
  },
  {
    id: "hot-2",
    name: "Embassy Suites",
    address: "1420 Stout St, Denver, CO",
    website: "https://hilton.com",
    bookingLink: "https://hilton.com/group-booking/givehope25",
    distanceLabel: "0.2 miles (5 min walk)",
    contractedRate: "$165/night",
    roomBlockTotal: 100,
    roomBlockFilled: 20,
    amenities: ["Breakfast Included", "Happy Hour"],
  },
];

const MOCK_SESSIONS: Session[] = [
  {
    id: "sess-1",
    title: "Opening Keynote: The Future of Aid",
    description: "Welcome to GIC 2025",
    date: "2025-10-15",
    startTime: "09:00",
    endTime: "10:30",
    venueId: "ven-1",
    roomId: "rm-1",
    speakerIds: ["spk-1"],
    trackId: "tr-1",
    typeId: "typ-1",
    isPublished: true,
  },
  {
    id: "sess-2",
    title: "Tech for Good Workshop",
    description: "AI in humanitarian aid",
    date: "2025-10-15",
    startTime: "11:00",
    endTime: "12:00",
    venueId: "ven-1",
    roomId: "rm-2",
    speakerIds: ["spk-2"],
    trackId: "tr-3",
    typeId: "typ-2",
    isPublished: true,
  },
  {
    id: "sess-3",
    title: "Leadership Panel",
    description: "Leading through crisis",
    date: "2025-10-15",
    startTime: "11:00",
    endTime: "12:00",
    venueId: "ven-1",
    roomId: "rm-3",
    speakerIds: ["spk-1"],
    trackId: "tr-1",
    typeId: "typ-3",
    isPublished: true,
  },
];

const INITIAL_EVENTS: ConferenceEvent[] = [
  {
    id: "evt-1",
    name: "Global Impact Conference 2025",
    slug: "global-impact-2025",
    description:
      "The annual gathering of humanitarian leaders, innovators, and boots-on-the-ground partners.",
    startDate: "2025-10-15",
    endDate: "2025-10-17",
    startTime: "08:00",
    status: "Published",
    registrants: 450,
    capacity: 1200,
    revenue: 112500,
    goalRevenue: 250000,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000",
    fundCode: "CONF-25",

    // Configuration
    venues: MOCK_VENUES,
    hotels: MOCK_HOTELS,
    logistics: {
      wifiSsid: "GiveHope_Guest",
      wifiPass: "Impact2025!",
      timezone: "America/Denver",
      emergencyPhone: "+1 555-0199",
      emergencyEmail: "help@givehope.org",
      transportOptions: [
        {
          type: "Airport",
          name: "Denver International (DIA)",
          details: "25 miles, 40 min drive or take A-Line train.",
        },
        {
          type: "Parking",
          name: "Convention Center Garage",
          details: "$12/day early bird rate. Entrance on 14th St.",
        },
      ],
      localAmenities: [
        {
          id: "am-1",
          name: "Blue Bear Cafe",
          type: "Coffee",
          address: "Inside Convention Center",
          description: "Quick coffee and snacks.",
        },
        {
          id: "am-2",
          name: "Stout Street Social",
          type: "Restaurant",
          address: "1400 Stout St",
          description: "Great for team dinners.",
        },
      ],
    },
    tracks: [
      {
        id: "tr-1",
        name: "Leadership",
        color: "bg-purple-100 text-purple-700",
        description: "For executive directors and board members.",
      },
      {
        id: "tr-2",
        name: "Field Ops",
        color: "bg-emerald-100 text-emerald-700",
        description: "Practical skills for on-ground work.",
      },
      {
        id: "tr-3",
        name: "Technology",
        color: "bg-blue-100 text-blue-700",
        description: "Digital transformation in aid.",
      },
    ],
    sessionTypes: [
      { id: "typ-1", name: "Keynote" },
      { id: "typ-2", name: "Workshop" },
      { id: "typ-3", name: "Panel" },
      { id: "typ-4", name: "Networking" },
    ],
    sessions: MOCK_SESSIONS,
  },
];

const MOCK_SPEAKERS: Speaker[] = [
  {
    id: "spk-1",
    eventId: "evt-1",
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena.r@givehope.org",
    jobTitle: "Executive Director",
    company: "GiveHope",
    bio: "<p>Dr. Elena Rostova has over 20 years of experience.</p>",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    status: "Confirmed",
    sessions: ["sess-1"],
  },
  {
    id: "spk-2",
    eventId: "evt-1",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@agritech.io",
    jobTitle: "Founder",
    company: "AgriTech",
    bio: "<p>David pioneers sustainable farming.</p>",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    status: "Confirmed",
    sessions: [],
  },
];

const MOCK_ATTENDEES: Attendee[] = [
  {
    id: "att-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    ticketType: "General Admission",
    status: "Registered",
    paymentStatus: "Paid",
    organization: "First Baptist",
    registrationDate: "2025-08-10",
    assignedSessions: ["sess-1", "sess-3"],
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    jobTitle: "Outreach Coordinator",
  },
  {
    id: "att-2",
    name: "Bob Smith",
    email: "bob@example.com",
    ticketType: "VIP",
    status: "Checked In",
    paymentStatus: "Paid",
    checkInTime: "2025-10-15T08:45:00",
    organization: "Grace Community",
    registrationDate: "2025-07-22",
    dietaryRestrictions: "Gluten Free",
    assignedSessions: ["sess-1", "sess-2"],
    isVip: true,
    notes: "Seat in front row for Keynote.",
  },
  {
    id: "att-3",
    name: "Charlie Davis",
    email: "charlie@example.com",
    ticketType: "General Admission",
    status: "Cancelled",
    paymentStatus: "Refunded",
    registrationDate: "2025-09-01",
    assignedSessions: [],
  },
  {
    id: "att-4",
    name: "Diana Evans",
    email: "diana@example.com",
    ticketType: "Speaker",
    status: "Registered",
    paymentStatus: "Paid",
    organization: "GiveHope HQ",
    registrationDate: "2025-06-15",
    assignedSessions: ["sess-1"],
    jobTitle: "Director of Programs",
    isVip: true,
  },
  {
    id: "att-5",
    name: "Evan Wright",
    email: "evan@example.com",
    ticketType: "Volunteer",
    status: "Checked In",
    paymentStatus: "Paid",
    checkInTime: "2025-10-15T07:30:00",
    registrationDate: "2025-09-10",
    assignedSessions: [],
    accessibilityNeeds: "Wheelchair access required for breakouts.",
  },
];

// --- Helper Functions ---

const getStatusColor = (status: SpeakerStatus) => {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Invited":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Declined":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
};

const getAttendeeStatusColor = (status: Attendee["status"]) => {
  switch (status) {
    case "Checked In":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Registered":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Waitlist":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-zinc-100 text-zinc-600 border-zinc-200";
  }
};

const getPaymentStatusColor = (status: Attendee["paymentStatus"]) => {
  switch (status) {
    case "Paid":
      return "bg-emerald-500";
    case "Pending":
    case "Due":
      return "bg-amber-500";
    case "Refunded":
      return "bg-blue-500";
    default:
      return "bg-zinc-400";
  }
};

const _formatTime = (time: string) => {
  const parts = time.split(":");
  const hours = parts[0] ?? "0";
  const minutes = parts[1] ?? "00";
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const _getDuration = (start: string, end: string) => {
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);
  const sH = startParts[0] ?? 0;
  const sM = startParts[1] ?? 0;
  const eH = endParts[0] ?? 0;
  const eM = endParts[1] ?? 0;
  const totalMinutes = eH * 60 + eM - (sH * 60 + sM);
  return totalMinutes + "m";
};

const RegistrationTrendsChart = dynamic(
  () =>
    import("./registration-trends-chart").then(
      (mod) => mod.RegistrationTrendsChart,
    ),
  {
    ssr: false,
    loading: () => (
      <Card className="col-span-4 overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/30">
          <CardTitle className="text-base font-bold">
            Registration Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] animate-pulse rounded-xl bg-zinc-100" />
        </CardContent>
      </Card>
    ),
  },
);

// --- Main Page ---

type EventsView = "dashboard" | "config" | "speakers" | "attendees";

const isEventsView = (value: string): value is EventsView =>
  value === "dashboard" ||
  value === "config" ||
  value === "speakers" ||
  value === "attendees";

const STAT_CARD_TRANSITION = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

function EventMetricCard({
  title,
  value,
  context,
  icon: Icon,
  iconClassName,
  children,
}: {
  title: string;
  value: React.ReactNode;
  context: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-zinc-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 py-4 pb-2">
        <CardTitle className="text-sm font-semibold text-zinc-700">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconClassName)} />
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-0">
        <div className="text-2xl font-bold tabular-nums text-zinc-950">
          {value}
        </div>
        <p className="mt-1 text-xs font-medium text-zinc-500">{context}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function EventsOverviewTab({ event }: { event: ConferenceEvent }) {
  const registrationCapacity = deriveRegistrationCapacity(event);

  return (
    <TabsContent value="dashboard" className="mt-5 space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...STAT_CARD_TRANSITION,
              delay: 0 * 0.06,
            }}
            whileHover={{ y: -2 }}
          >
            <EventMetricCard
              title="Registrations"
              icon={Users}
              iconClassName="text-blue-600"
              context={registrationCapacity.seatsRemainingLabel}
              value={
                <>
                  {event.registrants.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-zinc-500">
                    / {registrationCapacity.capacityLabel}
                  </span>
                </>
              }
            >
              <Progress
                value={registrationCapacity.progressValue}
                className="mt-3 h-1.5"
              />
            </EventMetricCard>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...STAT_CARD_TRANSITION,
              delay: 1 * 0.06,
            }}
            whileHover={{ y: -2 }}
          >
            <EventMetricCard
              title="Event revenue"
              value={formatCurrency(event.revenue)}
              context={`Goal: ${formatCurrency(event.goalRevenue || 0)}`}
              icon={DollarSign}
              iconClassName="text-emerald-600"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...STAT_CARD_TRANSITION,
              delay: 2 * 0.06,
            }}
            whileHover={{ y: -2 }}
          >
            <EventMetricCard
              title="Days remaining"
              value="42"
              context="Starting Oct 15, 2025"
              icon={Timer}
              iconClassName="text-amber-600"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...STAT_CARD_TRANSITION,
              delay: 3 * 0.06,
            }}
            whileHover={{ y: -2 }}
          >
            <EventMetricCard
              title="Check-in rate"
              value="0%"
              context="Door opens at 08:00 AM"
              icon={ScanLine}
              iconClassName="text-blue-600"
            />
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          <RegistrationTrendsChart />
          <Card className="col-span-3 overflow-hidden">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/30 px-5 py-4">
              <CardTitle className="text-base font-bold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 p-5">
              <Button
                variant="outline"
                className="flex h-18 flex-col gap-1.5 rounded-xl border-zinc-200 text-xs font-semibold"
              >
                <Printer className="h-5 w-5 text-zinc-500" />
                <span>Print Badges</span>
              </Button>
              <Button
                variant="outline"
                className="flex h-18 flex-col gap-1.5 rounded-xl border-zinc-200 text-xs font-semibold"
              >
                <Mail className="h-5 w-5 text-zinc-500" />
                <span>Email Attendees</span>
              </Button>
              <Button
                variant="outline"
                className="flex h-18 flex-col gap-1.5 rounded-xl border-zinc-200 text-xs font-semibold"
              >
                <FileText className="h-5 w-5 text-zinc-500" />
                <span>Run Reports</span>
              </Button>
              <Button
                variant="outline"
                className="flex h-18 flex-col gap-1.5 rounded-xl border-zinc-200 text-xs font-semibold"
              >
                <Settings className="h-5 w-5 text-zinc-500" />
                <span>Integrations</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </TabsContent>
  );
}

function EventsConfigTab({ event }: { event: ConferenceEvent }) {
  return (
    <TabsContent value="config" className="mt-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[600px] flex-col gap-5 lg:flex-row"
      >
        <div className="w-full shrink-0 space-y-1 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm lg:w-64">
          <Button
            variant="ghost"
            className="h-9 w-full justify-start gap-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-800 hover:text-white"
          >
            <Building className="h-4 w-4" /> Venues & Spaces
          </Button>
          <Button
            variant="ghost"
            className="h-9 w-full justify-start gap-3 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
          >
            <BedDouble className="h-4 w-4" /> Lodging & Travel
          </Button>
          <Button
            variant="ghost"
            className="h-9 w-full justify-start gap-3 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
          >
            <Wifi className="h-4 w-4" /> Event Logistics
          </Button>
          <Button
            variant="ghost"
            className="h-9 w-full justify-start gap-3 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
          >
            <Layers className="h-4 w-4" /> Tracks & Types
          </Button>
        </div>
        <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                Venues & Spaces
              </h3>
              <p className="text-zinc-500 text-sm">
                Configure physical locations and assign rooms.
              </p>
            </div>
            <Button className="h-9 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800">
              <Plus className="mr-2 h-4 w-4" /> Add Venue
            </Button>
          </div>
          {event.venues.map((venue) => (
            <Card
              key={venue.id}
              className="mb-4 border-zinc-200 bg-zinc-50/50 shadow-none"
            >
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200 text-blue-600">
                    <Building className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{venue.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Toggle details for ${venue.name}`}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 md:grid-cols-2">
                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-500">
                      Address
                    </Label>
                    <p className="text-sm font-medium">
                      {venue.address}, {venue.city}, {venue.state} {venue.zip}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-500">
                      Rooms
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {venue.rooms.map((room) => (
                        <Badge
                          key={room.id}
                          variant="secondary"
                          className="bg-white border-zinc-200 text-zinc-600 font-medium"
                        >
                          {room.name} ({room.capacity})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-zinc-500">
                      Arrival Info
                    </Label>
                    <p className="text-sm text-zinc-600 leading-relaxed italic">
                      &quot;{venue.directions}&quot;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </TabsContent>
  );
}

const SPEAKER_CARD_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

function EventsSpeakersTab({
  event,
  speakers,
}: {
  event: ConferenceEvent;
  speakers: Speaker[];
}) {
  return (
    <TabsContent value="speakers" className="mt-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {speakers.map((speaker) => (
          <motion.div
            key={speaker.id}
            whileHover={{ y: -2 }}
            transition={SPEAKER_CARD_SPRING}
          >
            <Card className="group cursor-pointer overflow-hidden transition-shadow [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md">
              <CardHeader className="flex flex-row items-start gap-4 p-5">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm transition-transform [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105">
                  <AvatarImage src={speaker.avatar} />
                  <AvatarFallback className="bg-zinc-100 font-bold">
                    {speaker.firstName[0]}
                    {speaker.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-zinc-900 leading-none">
                    {speaker.firstName} {speaker.lastName}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {speaker.jobTitle}
                  </p>
                  <p className="text-xs font-semibold text-zinc-700 mt-0.5">
                    {speaker.company}
                  </p>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 px-1.5 text-[10px] font-semibold shadow-none",
                        getStatusColor(speaker.status),
                      )}
                    >
                      {speaker.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 text-left">
                <Separator className="mb-3 opacity-50" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                    <span>Assigned Sessions</span>
                    <span className="text-zinc-900">
                      {speaker.sessions?.length || 0}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {speaker.sessions?.map((sessId) => {
                      const session = event.sessions.find(
                        (s) => s.id === sessId,
                      );
                      return session ? (
                        <div
                          key={sessId}
                          className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-100"
                        >
                          <Presentation className="h-3 w-3 text-zinc-400" />
                          <span className="text-xs font-medium text-zinc-700 truncate">
                            {session.title}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-0 border-t border-zinc-100 divide-x divide-zinc-100 h-10">
                <Button
                  variant="ghost"
                  className="w-full h-full rounded-none text-xs font-semibold text-zinc-500 hover:text-blue-600"
                >
                  <Mail className="h-3.5 w-3.5 mr-2" /> Message
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-full rounded-none text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                >
                  <User className="h-3.5 w-3.5 mr-2" /> Details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
        <button className="press-feedback group flex h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-500 transition-[background-color,border-color,color] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-sm">
            <Plus className="h-6 w-6" />
          </div>
          <span className="font-bold text-sm">Add New Speaker</span>
        </button>
      </motion.div>
    </TabsContent>
  );
}

function EventsAttendeesTab() {
  const attendeesQuery = useEventAttendees();
  const attendees = attendeesQuery.data ?? MOCK_ATTENDEES;
  const columns = React.useMemo<ColumnDef<Attendee>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Attendee" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.avatar} />
              <AvatarFallback className="text-[10px] bg-zinc-100 font-bold">
                {getInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm font-semibold text-zinc-900">
                {row.original.name}{" "}
                {row.original.isVip && (
                  <Badge className="ml-1 h-4 bg-amber-100 text-amber-700 hover:bg-amber-100 text-[8px] uppercase tracking-tighter px-1 border-none shadow-none">
                    VIP
                  </Badge>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">
                {row.original.email}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "ticketType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "h-5 text-[10px] font-semibold shadow-none",
              getAttendeeStatusColor(row.original.status),
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                getPaymentStatusColor(row.original.paymentStatus),
              )}
            />
            <span className="text-xs font-medium text-zinc-700">
              {row.original.paymentStatus}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        cell: () => (
          <div className="flex justify-end pr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500"
              aria-label="Open attendee actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <TabsContent value="attendees" className="mt-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border-zinc-200 shadow-sm">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search attendees..."
                className="pl-9 bg-white"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="rounded-xl border-zinc-200 bg-white text-xs font-semibold shadow-none"
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button className="rounded-xl bg-zinc-900 text-xs font-semibold text-white hover:bg-zinc-800">
                <UserPlus className="mr-2 h-4 w-4" /> Register Person
              </Button>
            </div>
          </div>
          <DataTableWrapper
            columns={columns}
            data={attendees}
            isLoading={attendeesQuery.isLoading}
            config={{
              enableRowSelection: false,
              enableColumnVisibility: false,
              enablePagination: true,
              enableFilters: false,
              enableSorting: true,
            }}
            emptyState={{
              title: "No attendees found",
              description:
                "No attendee records match the current event filters.",
            }}
          />
        </Card>
      </motion.div>
    </TabsContent>
  );
}

export default function EventsPage() {
  const [activeView, setActiveView] = useState<EventsView>("dashboard");
  const [event, _setEvent] = useState<ConferenceEvent>(INITIAL_EVENTS[0]!);

  return (
    <PageShell
      title="Events"
      description="Plan events, sessions, speakers, registrations, and logistics."
      density="compact"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-zinc-200 bg-white px-4 text-xs font-semibold shadow-sm hover:bg-zinc-50"
          >
            <Eye className="mr-2 h-4 w-4" /> Preview Site
          </Button>
          <Button className="h-10 rounded-xl bg-zinc-900 px-4 text-xs font-semibold text-white shadow-md shadow-zinc-200 hover:bg-zinc-800">
            <Plus className="mr-2 h-4 w-4" /> New Event
          </Button>
        </div>
      }
    >
      <div className="space-y-5 animate-in fade-in duration-[var(--duration-standard)] ease-[var(--ease-out-soft)]">
        <Tabs
          value={activeView}
          onValueChange={(value) => {
            if (isEventsView(value)) {
              setActiveView(value);
            }
          }}
          className="w-full"
        >
          <TabsList className="rounded-xl border border-zinc-200 bg-zinc-100/50 p-1">
            <TabsTrigger
              value="dashboard"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="speakers"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Speakers
            </TabsTrigger>
            <TabsTrigger
              value="attendees"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Attendees
            </TabsTrigger>
          </TabsList>

          <EventsOverviewTab event={event} />
          <EventsConfigTab event={event} />
          <EventsSpeakersTab event={event} speakers={MOCK_SPEAKERS} />
          <EventsAttendeesTab />
        </Tabs>
      </div>
    </PageShell>
  );
}
