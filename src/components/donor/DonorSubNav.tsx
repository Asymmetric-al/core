'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  History, 
  Rss, 
  RefreshCw, 
  Wallet, 
  Settings 
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/donor-dashboard', icon: LayoutDashboard },
  { label: 'Donation History', href: '/donor-dashboard/history', icon: History },
  { label: 'Ministry Updates', href: '/donor-dashboard/feed', icon: Rss },
  { label: 'Recurring Giving', href: '/donor-dashboard/pledges', icon: RefreshCw },
  { label: 'Wallet', href: '/donor-dashboard/wallet', icon: Wallet },
  { label: 'Settings', href: '/donor-dashboard/settings', icon: Settings },
];

export function DonorSubNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-200 bg-white sticky top-16 z-40">
      <div className="container-responsive">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/donor-dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all rounded-lg',
                    isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
