'use client'

import React from 'react';
import { 
  Shield, Globe, Key, Sparkles, Download, 
  Activity, CheckCircle, ArrowRight,
  Database, Lock, Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Administration</h2>
          <p className="text-slate-500 mt-1">Global system configuration and security oversight.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm">
            <Activity className="mr-2 h-4 w-4 text-slate-400"/> Audit Logs
          </Button>
          <Button className="bg-slate-900 text-white shadow-xl hover:bg-slate-800">
            <Shield className="mr-2 h-4 w-4"/> Security Scan
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-left">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Custom Domains</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">4</div>
            <div className="flex items-center gap-1 mt-1 text-zinc-600">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs font-medium">All SSL active</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">API Keys</CardTitle>
            <Key className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">8</div>
            <p className="text-xs text-slate-500 mt-1">all keys rotated recently</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">System Health</CardTitle>
            <Activity className="h-4 w-4 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">100%</div>
            <p className="text-xs text-slate-500 mt-1">all services operational</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">high privilege accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'Teams & Users',
            desc: 'Manage organizational units, member invites, and global permissions.',
            icon: Users,
            className: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
            href: '/mc/admin/teams',
            action: 'Manage Teams'
          },
          {
            title: 'Domains & Certificates',
            desc: 'Configure custom domains for Web Studio, Email, and Callbacks.',
            icon: Globe,
            className: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
            href: '/mc/admin/domains',
            action: 'Manage Domains'
          },
          {
            title: 'API Keys & Secrets',
            desc: 'Securely manage integration credentials and service tokens.',
            icon: Key,
            className: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
            href: '/mc/admin/keys',
            action: 'View Keys'
          },
          {
            title: 'AI Model Settings',
            desc: 'Configure LLM providers, API keys, and model parameters.',
            icon: Sparkles,
            className: 'bg-zinc-50 text-zinc-600 group-hover:bg-zinc-600 group-hover:text-white',
            href: '/mc/admin/ai',
            action: 'Configure AI'
          },
          {
            title: 'Data Exports',
            desc: 'Schedule and manage periodic data dumps for audit or backup.',
            icon: Download,
            className: 'bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white',
            href: '/mc/admin/exports',
            action: 'View Exports'
          },
          {
            title: 'Security & Auth',
            desc: 'Configure MFA, session policies, and SSO integrations.',
            icon: Lock,
            className: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
            href: '/mc/admin/security',
            action: 'Security Settings'
          }
        ].map((item) => (
          <Link key={item.title} href={item.href} className="group block">
            <Card className="h-full overflow-hidden border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50">
              <CardHeader className="pb-4">
                <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors", item.className)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors text-left">
                  {item.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm text-slate-500 mt-1.5 text-left">
                  {item.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-sm font-semibold text-slate-600 group-hover:text-zinc-900 transition-colors mt-auto">
                  {item.action}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Service Status and Best Practices */}
      <div className="grid gap-6 md:grid-cols-2 text-left">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Service Operational Status</CardTitle>
            <CardDescription>Real-time health check of primary integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Supabase Database', status: 'Operational' },
              { name: 'Stripe Payments', status: 'Operational' },
              { name: 'Postmark Email', status: 'Operational' },
              { name: 'Vercel Deployment', status: 'Operational' }
            ].map((service) => (
              <div key={service.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <span className="text-sm font-medium text-slate-700">{service.name}</span>
                <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-zinc-200 shadow-none">
                  <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-zinc-500 animate-pulse" />
                  {service.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Security Best Practices</CardTitle>
            <CardDescription>Essential security measures for administrators.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4 space-y-3">
                {[
                  'Rotate API keys and service tokens quarterly.',
                  'Enforce MFA for all user accounts with MC access.',
                  'Review audit logs weekly for unusual access patterns.',
                  'Maintain separate staging environments for testing.'
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <span className="text-sm text-slate-600">{tip}</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
