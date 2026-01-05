'use client'

import React from 'react';
import { 
  Zap, Link2, AlertTriangle, History, Play, RefreshCw, 
  Clock, CheckCircle, Plus, Search, MoreHorizontal,
  ChevronRight, ArrowUpRight, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function AutomationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-slate-900">Automations</h2>
           <p className="text-slate-500 mt-1">Orchestrate your ministry workflows and integrations.</p>
        </div>
        <div className="flex gap-2">
             <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm">
                <History className="mr-2 h-4 w-4 text-slate-400"/> History
            </Button>
             <Button className="bg-slate-900 text-white shadow-xl hover:bg-slate-800">
                <Plus className="mr-2 h-4 w-4"/> New Flow
            </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-left">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Flows</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">28</div>
            <p className="text-xs text-slate-500 mt-1">across 12 integrations</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Executions (24h)</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">1,247</div>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs font-medium">99.2% success</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Connections</CardTitle>
            <Link2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">all systems operational</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Failed Runs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">8</div>
            <p className="text-xs text-slate-500 mt-1">require manual review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7 text-left">
        {/* Flows Table */}
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-base font-bold">Recent Flows</CardTitle>
                <CardDescription className="text-xs">Your most active automation workflows.</CardDescription>
            </div>
            <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Filter flows..." className="pl-8 h-8 text-xs bg-slate-50 border-none" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {[
                { name: 'mobilize.advance-to-interview', trigger: 'Stage Change', app: 'Mobilize', status: 'Active' },
                { name: 'giving.send-thank-you', trigger: 'New Gift', app: 'Stripe', status: 'Active' },
                { name: 'care.alert-on-gap', trigger: 'Inactivity', app: 'Reports', status: 'Active' },
                { name: 'crm.sync-to-mailchimp', trigger: 'New Contact', app: 'CRM', status: 'Paused' },
              ].map((flow) => (
                <div key={flow.name} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border", flow.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100")}>
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{flow.name}</p>
                      <p className="text-xs text-slate-500">Trigger: {flow.trigger} • via {flow.app}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={cn("text-[10px] font-bold h-5 shadow-none", flow.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>
                      {flow.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-slate-900">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="p-3 border-t border-slate-50 bg-slate-50/30 text-center">
             <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900 w-full h-8 group">
                View All Flows <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
             </Button>
          </div>
        </Card>

        {/* Integration Connections */}
        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-base font-bold">Integration Health</CardTitle>
            <CardDescription className="text-xs">Status of third-party platform connections.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {[
              { name: 'Stripe', status: 'Operational', icon: Link2, color: 'blue' },
              { name: 'Mailchimp', status: 'Operational', icon: Link2, color: 'amber' },
              { name: 'Slack', status: 'Issue Detected', icon: AlertTriangle, color: 'rose' },
              { name: 'Postmark', status: 'Operational', icon: Link2, color: 'emerald' },
            ].map((conn) => (
              <div key={conn.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg bg-${conn.color}-50 text-${conn.color}-600 flex items-center justify-center border border-${conn.color}-100`}>
                    <conn.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{conn.name}</span>
                </div>
                <Badge className={cn("text-[10px] font-bold h-5 shadow-none", conn.status === 'Operational' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200")}>
                  {conn.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs font-bold text-slate-600 border-slate-200 h-10 mt-2">
              <Settings className="mr-2 h-3.5 w-3.5" /> Manage Connections
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Best Practices */}
      <Card className="border-slate-200 text-left">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Automation Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">idempotency keys</code> on all create actions to prevent duplicates.</li>
            <li>Always prefix flow names by domain: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">mobilize.</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">giving.</code>, etc.</li>
            <li>Owners must subscribe to failure alerts via Slack or Email.</li>
            <li>Test flows in isolation before deploying to production streams.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
