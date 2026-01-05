'use client';

import React, { useCallback } from 'react';
import { 
  CommandDialog, CommandEmpty, CommandGroup, 
  CommandInput, CommandItem, CommandList 
} from '@/components/ui/command';
import { 
  Search, User, Heart, 
  Settings, Zap, Calendar,
  ShieldCheck, MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CarePersonnel } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CareToolsProps {
  personnel: CarePersonnel[];
}

export function CareTools({ personnel }: CareToolsProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <Button 
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group border-none"
        >
          <Zap className="h-6 w-6 transition-transform group-hover:rotate-12 fill-current" />
          <span className="sr-only">Open Care Tools</span>
          
          {/* Keycap Hint - Hidden on mobile */}
          <div className="absolute -top-2 -left-2 h-6 px-1.5 rounded-lg bg-background border border-border/50 text-[10px] font-black shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hide-mobile">
            ⌘K
          </div>
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="p-2 border-b border-border/50 bg-muted/20">
          <CommandInput 
            placeholder="Search personnel, care actions, or settings..." 
            className="border-none focus:ring-0 text-sm font-medium"
          />
        </div>
        <CommandList className="max-h-[400px] p-2">
          <CommandEmpty className="py-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-primary">No matching results</p>
            <p className="text-xs text-muted-foreground mt-1">Try searching for a name, region, or action.</p>
          </CommandEmpty>

          <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 py-3 block">Personnel Directory</span>}>
            {personnel.map((p) => (
              <CommandItem 
                key={p.id} 
                onSelect={() => navigate(`/mc/care/directory/${p.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center text-[10px] font-black border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {p.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-primary">{p.name}</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.region} • {p.role}</span>
                </div>
                <Badge variant="outline" className="ml-auto text-[9px] font-black uppercase tracking-tighter border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Profile
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 py-3 block">Care Actions</span>}>
            <CommandItem 
              onSelect={() => navigate('/mc/care/directory')}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Search className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Browse All Personnel</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => {}}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Heart className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Log Quick Wellness Check</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => {}}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Send Team Broadcast</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading={<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 py-3 block">System</span>}>
            <CommandItem 
              onSelect={() => navigate('/mc/care/settings')}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-muted transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Settings className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Member Care Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
