"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  QrCode,
  Printer,
  X,
  Layout,
  FileText,
  Settings,
  ArrowLeft,
  Mic2,
  List,
  Grid,
  CreditCard,
  ExternalLink,
  Download,
  BarChart3,
  ScanLine,
  TrendingUp,
  Mail,
  Save,
  UserPlus,
  Trash2,
  Linkedin,
  Twitter,
  Globe,
  Image as ImageIcon,
  Upload,
  AtSign,
  Briefcase,
  User,
  Check,
  GripVertical,
  FileInput,
  ListOrdered,
  ToggleLeft,
  Layers,
  AlertCircle,
  Eye,
  Copy,
  ArrowDown,
  Type,
  Plane,
  Database,
  Lock,
  Shield,
  RotateCcw,
  Code,
  Palette,
  Terminal,
  Megaphone,
  Webhook,
  Key,
  MousePointerClick,
  Ticket,
  AlignLeft,
  CheckSquare,
  Radio,
  CalendarDays,
  Tag,
  AlertTriangle,
  ArrowUpRight,
  Compass,
  DoorOpen,
  Presentation,
  Utensils,
  Accessibility,
  CloudSun,
  Timer,
  BellRing,
  Building,
  Navigation,
  Wifi,
  Bed,
  Car,
  Smartphone,
  Bus,
  Coffee,
  Map,
  BedDouble,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  Reorder,
  useDragControls,
} from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, cn, getInitials } from "@/lib/utils";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

const DEFAULT_FORM_FIELDS: FormField[] = [
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

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

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
      return "bg-slate-100 text-slate-700";
  }
};

const formatTime = (time: string) => {
  const parts = time.split(":");
  const hours = parts[0] ?? "0";
  const minutes = parts[1] ?? "00";
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const getDuration = (start: string, end: string) => {
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);
  const sH = startParts[0] ?? 0;
  const sM = startParts[1] ?? 0;
  const eH = endParts[0] ?? 0;
  const eM = endParts[1] ?? 0;
  const totalMinutes = eH * 60 + eM - (sH * 60 + sM);
  return totalMinutes + "m";
};

// --- Main Page ---

export default function EventsPage() {
  const [activeView, setActiveView] = useState<
    "dashboard" | "config" | "speakers" | "attendees"
  >("dashboard");
  const [event, setEvent] = useState<ConferenceEvent>(INITIAL_EVENTS[0]!);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {event.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {event.venues[0]?.city},{" "}
                {event.venues[0]?.state}
              </span>
              <span>•</span>
              <span>{formatDateRange(event.startDate, event.endDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
          >
            <Eye className="mr-2 h-4 w-4 text-slate-400" /> Preview Site
          </Button>
          <Button className="bg-slate-900 text-white shadow-xl hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" /> New Event
          </Button>
        </div>
      </div>

      <Tabs
        value={activeView}
        onValueChange={setActiveView as any}
        className="w-full"
      >
        <TabsList className="bg-slate-100/50 border border-slate-200 p-1 rounded-xl">
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

        <TabsContent value="dashboard" className="mt-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Registrations
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {event.registrants}{" "}
                  <span className="text-slate-400 text-sm font-normal">
                    / {event.capacity}
                  </span>
                </div>
                <Progress
                  value={(event.registrants / event.capacity) * 100}
                  className="h-1.5 mt-3"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Event Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(event.revenue)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Goal: {formatCurrency(event.goalRevenue || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Days Remaining
                </CardTitle>
                <Timer className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-slate-500 mt-1">
                  Starting Oct 15, 2025
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Check-in Rate
                </CardTitle>
                <ScanLine className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-slate-500 mt-1">
                  Door opens at 08:00 AM
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            <Card className="col-span-4 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/30">
                <CardTitle className="text-base font-bold">
                  Registration Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { date: "Aug 1", count: 120 },
                        { date: "Aug 8", count: 180 },
                        { date: "Aug 15", count: 240 },
                        { date: "Aug 22", count: 310 },
                        { date: "Aug 29", count: 380 },
                        { date: "Sep 5", count: 450 },
                      ]}
                    >
                      <defs>
                        <linearGradient
                          id="colorCount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/30">
                <CardTitle className="text-base font-bold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 rounded-xl"
                >
                  <Printer className="h-6 w-6 text-slate-400" />
                  <span>Print Badges</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 rounded-xl"
                >
                  <Mail className="h-6 w-6 text-slate-400" />
                  <span>Email Attendees</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 rounded-xl"
                >
                  <FileText className="h-6 w-6 text-slate-400" />
                  <span>Run Reports</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col gap-2 rounded-xl"
                >
                  <Settings className="h-6 w-6 text-slate-400" />
                  <span>Integrations</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-8">
          <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Simplified placeholder for configuration UI */}
            <div className="w-64 space-y-2 shrink-0">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
              >
                <Building className="h-4 w-4" /> Venues & Spaces
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-600"
              >
                <BedDouble className="h-4 w-4" /> Lodging & Travel
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-600"
              >
                <Wifi className="h-4 w-4" /> Event Logistics
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-600"
              >
                <Layers className="h-4 w-4" /> Tracks & Types
              </Button>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Venues & Spaces
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Configure physical locations and assign rooms.
                  </p>
                </div>
                <Button className="bg-slate-900 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Venue
                </Button>
              </div>
              {event.venues.map((venue) => (
                <Card
                  key={venue.id}
                  className="border-slate-200 shadow-none bg-slate-50/50 mb-6"
                >
                  <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-600">
                        <Building className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{venue.name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4 text-left">
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-slate-400 font-bold">
                          Address
                        </Label>
                        <p className="text-sm font-medium">
                          {venue.address}, {venue.city}, {venue.state}{" "}
                          {venue.zip}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-slate-400 font-bold">
                          Rooms
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {venue.rooms.map((room) => (
                            <Badge
                              key={room.id}
                              variant="secondary"
                              className="bg-white border-slate-200 text-slate-600 font-medium"
                            >
                              {room.name} ({room.capacity})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 text-left">
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-slate-400 font-bold">
                          Arrival Info
                        </Label>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          &quot;{venue.directions}&quot;
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="speakers" className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_SPEAKERS.map((speaker) => (
              <Card
                key={speaker.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              >
                <CardHeader className="p-6 flex flex-row items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarImage src={speaker.avatar} />
                    <AvatarFallback className="bg-slate-100 font-bold">
                      {speaker.firstName[0]}
                      {speaker.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-slate-900 leading-none">
                      {speaker.firstName} {speaker.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {speaker.jobTitle}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {speaker.company}
                    </p>
                    <div className="mt-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase font-bold tracking-wider px-1.5 h-5 shadow-none",
                          getStatusColor(speaker.status),
                        )}
                      >
                        {speaker.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 text-left">
                  <Separator className="mb-4 opacity-50" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Assigned Sessions</span>
                      <span className="text-slate-900">
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
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <Presentation className="h-3 w-3 text-slate-400" />
                            <span className="text-xs font-medium text-slate-700 truncate">
                              {session.title}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-0 border-t border-slate-100 divide-x divide-slate-100 h-10">
                  <Button
                    variant="ghost"
                    className="w-full h-full rounded-none text-xs font-semibold text-slate-500 hover:text-blue-600"
                  >
                    <Mail className="h-3.5 w-3.5 mr-2" /> Message
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full h-full rounded-none text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    <User className="h-3.5 w-3.5 mr-2" /> Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
            <button className="h-[280px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all group">
              <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-bold text-sm">Add New Speaker</span>
            </button>
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="mt-8">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search attendees..."
                  className="pl-9 bg-white"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="bg-white shadow-none">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
                <Button className="bg-slate-900 text-white">
                  <UserPlus className="mr-2 h-4 w-4" /> Register Person
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="w-12 pl-4">
                      <input type="checkbox" className="rounded" />
                    </TableHead>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ATTENDEES.map((attendee) => (
                    <TableRow
                      key={attendee.id}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell className="pl-4">
                        <input type="checkbox" className="rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 py-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={attendee.avatar} />
                            <AvatarFallback className="text-[10px] bg-slate-100 font-bold">
                              {getInitials(attendee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="text-sm font-bold text-slate-900">
                              {attendee.name}{" "}
                              {attendee.isVip && (
                                <Badge className="ml-1 h-4 bg-amber-100 text-amber-700 hover:bg-amber-100 text-[8px] uppercase tracking-tighter px-1 border-none shadow-none">
                                  VIP
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {attendee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium text-slate-600">
                          {attendee.ticketType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold h-5 shadow-none",
                            attendee.status === "Checked In"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : attendee.status === "Registered"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {attendee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              attendee.paymentStatus === "Paid"
                                ? "bg-emerald-500"
                                : "bg-amber-500",
                            )}
                          />
                          <span className="text-xs font-medium text-slate-700">
                            {attendee.paymentStatus}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
