'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, Bell, Globe, Link as LinkIcon, 
  Shield, Save, Info, Check,
  ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export default function CareSettingsPage() {
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings updated successfully');
    }, 1000);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-zinc-900 text-left">Care Settings</h2>
        <p className="text-zinc-500 mt-1 font-medium text-left">Configure regional defaults and care workflow integrations.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          {/* Regional Localization */}
          <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-zinc-400" />
                <div>
                  <CardTitle className="text-lg font-bold text-zinc-900">Regional Localization</CardTitle>
                  <CardDescription className="text-xs font-medium text-zinc-500">Define your default focus area and timezone.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 text-left">
                  <Label htmlFor="region" className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">Default Region</Label>
                  <Select defaultValue="se-asia">
                    <SelectTrigger className="h-10 border-zinc-200 rounded-xl">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="africa">Africa</SelectItem>
                      <SelectItem value="se-asia">SE Asia</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="latin-america">Latin America</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="timezone" className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">My Timezone</Label>
                  <Select defaultValue="utc-5">
                    <SelectTrigger className="h-10 border-zinc-200 rounded-xl">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">Pacific Time (PT)</SelectItem>
                      <SelectItem value="utc-5">Eastern Time (ET)</SelectItem>
                      <SelectItem value="utc-0">London (GMT)</SelectItem>
                      <SelectItem value="utc+7">Bangkok (ICT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30">
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-zinc-400" />
                <div>
                  <CardTitle className="text-lg font-bold text-zinc-900">Connected Services</CardTitle>
                  <CardDescription className="text-xs font-medium text-zinc-500">Sync check-ins and appointments with external tools.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {[
                { name: 'Google Calendar', desc: 'Sync scheduled check-ins to your work calendar.', connected: true },
                { name: 'Cal.com', desc: 'Allow personnel to book care slots automatically.', connected: false },
                { name: 'Global Database', desc: 'Import and sync financial data signals.', connected: true, readonly: true },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white group hover:border-zinc-200 transition-colors">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900">{service.name}</span>
                        {service.connected && <Check className="h-3 w-3 text-zinc-900" />}
                    </div>
                    <p className="text-xs font-medium text-zinc-400">{service.desc}</p>
                  </div>
                  {service.readonly ? (
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-500 border-none">System Link</Badge>
                  ) : (
                    <Button variant={service.connected ? "outline" : "default"} size="sm" className={cn(
                      "h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg",
                      service.connected ? "border-zinc-200 text-zinc-500 hover:text-zinc-900" : "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200/50"
                    )}>
                      {service.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-zinc-200 shadow-sm overflow-hidden rounded-[2rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-zinc-400" />
                <div>
                  <CardTitle className="text-lg font-bold text-zinc-900">Alert Preferences</CardTitle>
                  <CardDescription className="text-xs font-medium text-zinc-500">Manage how you receive wellness and crisis updates.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {[
                { label: 'Email Summaries', desc: 'Weekly digest of personnel status changes.', default: true },
                { label: 'Crisis Push Alerts', desc: 'Immediate mobile notification for Crisis status.', default: true },
                { label: 'Care Gap Reminders', desc: 'Alert when personnel haven\'t checked in for 30d.', default: false },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <Label className="text-sm font-bold text-zinc-900">{pref.label}</Label>
                    <p className="text-xs font-medium text-zinc-400">{pref.desc}</p>
                  </div>
                  <Switch defaultChecked={pref.default} className="data-[state=checked]:bg-zinc-900" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-zinc-900 bg-zinc-900 text-white shadow-2xl shadow-zinc-300/50 overflow-hidden rounded-[2rem] sticky top-6">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="font-black text-xl tracking-tight">Save Changes</h3>
                <p className="text-[10px] font-medium text-zinc-500 leading-relaxed uppercase tracking-widest">
                  Update your global preferences. Changes apply immediately across the Member Care module.
                </p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-black h-12 shadow-lg rounded-2xl text-[10px] uppercase tracking-widest"
              >
                {saving ? 'Updating...' : <><Save className="mr-2 h-4 w-4" /> Update Settings</>}
              </Button>
              <div className="pt-6 border-t border-zinc-800 flex items-start gap-3">
                <Shield className="h-4 w-4 text-zinc-500 shrink-0" />
                <p className="text-[10px] font-medium text-zinc-500 text-left leading-relaxed">
                  Your data access is restricted to authorized personnel records. Pastoral notes are stored securely.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2rem]">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-2 text-zinc-900">
                <Info className="h-4 w-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Module Info</h4>
              </div>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Active Module</span>
                  <span className="font-bold text-zinc-900">Member Care</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Status</span>
                  <Badge className="bg-zinc-100 text-zinc-900 border-none text-[10px] px-2 h-5 font-bold uppercase tracking-widest">Active</Badge>
                </div>
                
                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tenant Website</span>
                    <span className="text-xs font-bold text-zinc-900">{siteConfig.name}</span>
                  </div>
                  <Button variant="outline" className="w-full h-10 rounded-xl border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-900 group" asChild>
                    <a href={siteConfig.url} target="_blank" rel="noopener noreferrer">
                      Visit Home Page
                      <ExternalLink className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
