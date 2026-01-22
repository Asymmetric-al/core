"use client";

import { TilePage } from "@/features/mission-control/components/tiles/tile-page";
import { getTileById } from "@/lib/mission-control/tiles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import Link from "next/link";
import {
  Inbox,
  Users,
  Tag,
  Zap,
  BookOpen,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@asym/ui/components/shadcn/badge";

export default function SupportHubPage() {
  const tile = getTileById("support")!;

  return (
    <TilePage tile={tile}>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Tickets</CardDescription>
            <CardTitle className="text-2xl">24</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-2xl">2.4h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">within SLA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Resolved (7d)</CardDescription>
            <CardTitle className="text-2xl">89</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">tickets closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Escalated</CardDescription>
            <CardTitle className="text-2xl text-amber-600">3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-amber-700">
            <Clock className="h-4 w-4" /> SLA Breach Warning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            2 tickets approaching first reply SLA. Review immediately.
          </p>
          <Link href="/mc/support/tickets?filter=sla-warning">
            <Button variant="outline" size="sm" className="mt-2">
              View Urgent
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Inbox className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Inbox</CardTitle>
            <CardDescription>View and respond to tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/support/inbox">
              <Button variant="outline" size="sm" className="w-full">
                Open Inbox
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <Users className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Contacts</CardTitle>
            <CardDescription>Linked CRM people and churches</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/support/contacts">
              <Button variant="outline" size="sm" className="w-full">
                View Contacts
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Tag className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Tags & Queues</CardTitle>
            <CardDescription>Finance, tech, member care</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/support/tags">
              <Button variant="outline" size="sm" className="w-full">
                Manage Tags
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Zap className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Macros</CardTitle>
            <CardDescription>
              Saved replies with merge variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/support/macros">
              <Button variant="outline" size="sm" className="w-full">
                View Macros
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Knowledge Base</CardTitle>
            <CardDescription>Internal docs and FAQs</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/support/knowledge">
              <Button variant="outline" size="sm" className="w-full">
                Browse Docs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Triage to queues: finance, tech, member care</li>
            <li>Set clear SLAs: first reply, next reply, resolution</li>
            <li>
              Convert long, repeat questions into public docs and link them from
              Web Studio
            </li>
            <li>
              Donation or account questions can open the gift drawer from
              Contributions in a side panel
            </li>
          </ul>
        </CardContent>
      </Card>
    </TilePage>
  );
}
