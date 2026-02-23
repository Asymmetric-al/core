import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { ShieldCheck, Users, Activity, Globe } from "lucide-react";
import Link from "next/link";

export default function SystemAdminPage() {
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            System Administration
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Global controls for Mission Control infrastructure and access.
          </p>
        </div>
        <Badge className="bg-zinc-900 text-white hover:bg-zinc-900">
          Internal
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Privileged Staff</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-zinc-900">
            12
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tenant Domains</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-zinc-900">
            4
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Auth Incidents</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-zinc-900">
            0
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System Health</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-zinc-900">
            100%
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Security & Access</CardTitle>
            <CardDescription>
              Manage global team permissions and monitor privileged operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/system-admin/teams">
                <Users className="mr-2 h-4 w-4" />
                Manage Teams
              </Link>
            </Button>
            <Button variant="outline">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Review Security
            </Button>
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Audit Activity
            </Button>
            <Button variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              Domain Controls
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
