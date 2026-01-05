'use client';

import React from 'react';
import { useCareProfile, useCareActivity } from '@/features/mission-control/care/hooks/use-care';
import { PersonnelProfile } from '@/features/mission-control/care/components/PersonnelProfile';
import { TimezoneScheduler } from '@/features/mission-control/care/components/TimezoneScheduler';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreVertical, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CareProfilePage() {
  const { id } = useParams();
  const { data: personnel, isLoading: loadingProfile } = useCareProfile(id as string);
  const { data: activities, isLoading: loadingActivities } = useCareActivity(id as string);

  if (loadingProfile || loadingActivities) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="md:col-span-2 h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!personnel) {
    return <div className="p-20 text-center text-slate-500 font-bold">Personnel not found</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link href="/mc/care/directory" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Directory
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 font-bold border-slate-200">
            <Edit className="mr-2 h-3.5 w-3.5 text-slate-400" /> Edit Profile
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200">
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PersonnelProfile 
            personnel={personnel} 
            activities={activities || []} 
          />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <TimezoneScheduler 
              remoteTimezone={personnel.timezone} 
              remoteName={personnel.name.split(' ')[0] ?? 'Team Member'} 
            />
          
          <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Last Contact</p>
                <p className="text-sm font-bold text-slate-900">2 days ago</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Frequency</p>
                <p className="text-sm font-bold text-slate-900">Every 14d</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Care Lead</p>
                <p className="text-sm font-bold text-slate-900">David Ross</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Support %</p>
                <p className="text-sm font-bold text-emerald-600">92%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
