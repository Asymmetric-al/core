'use client'

import { TilePage } from '@/features/mission-control/components/tiles/tile-page'
import { getTileById } from '@/lib/mission-control/tiles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PenTool, FileText, Send, CheckCircle, Search, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function SignStudioPage() {
  const tile = getTileById('sign')!

  return (
    <TilePage tile={tile}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Sends</CardDescription>
            <CardTitle className="text-2xl">18</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">awaiting signatures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed (30d)</CardDescription>
            <CardTitle className="text-2xl">142</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">all attached to CRM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Templates</CardDescription>
            <CardTitle className="text-2xl">24</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">active packet templates</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Search by signer name, email, or document ID..." className="max-w-md" />
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Packet Templates</CardTitle>
            <CardDescription>Forms, uploads, and signature steps</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/sign/templates">
              <Button variant="outline" size="sm" className="w-full">Manage Templates</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Send className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Active Sends</CardTitle>
            <CardDescription>Documents out for signature</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/sign/active">
              <Button variant="outline" size="sm" className="w-full">View Active</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Completed Docs</CardTitle>
            <CardDescription>Signed and archived documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/sign/completed">
              <Button variant="outline" size="sm" className="w-full">View Completed</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <Download className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Export</CardTitle>
            <CardDescription>Bulk download and audit exports</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/mc/sign/export">
              <Button variant="outline" size="sm" className="w-full">Export Documents</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Packet templates include forms, uploads, and signature steps</li>
            <li>Initiators can be staff or Mobilize flows</li>
            <li>Completed docs attach to CRM records with full audit trails</li>
          </ul>
        </CardContent>
      </Card>
    </TilePage>
  )
}
