"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  Calendar, 
  Share2, 
  FileText, 
  FileSignature, 
  PieChart, 
  LifeBuoy,
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Logo from "@/components/shadcn-studio/logo";
import { DashboardFooter } from "@/components/dashboard-footer";

const navigation = [
  { name: "Overview", href: "/mc", icon: LayoutDashboard },
  { name: "Contributions", href: "/mc/contributions", icon: DollarSign },
  { name: "CRM", href: "/mc/crm", icon: Users },
  { name: "Tasks", href: "/mc/tasks", icon: CheckSquare },
  { name: "Email Studio", href: "/mc/email", icon: Mail },
  { name: "Web Studio", href: "/mc/web-studio", icon: Globe },
  { name: "Admin", href: "/mc/admin", icon: ShieldCheck },
  { name: "Automations", href: "/mc/automations", icon: Zap },
  { name: "Member Care", href: "/mc/care", icon: MessageSquare },
  { name: "Events", href: "/mc/events", icon: Calendar },
  { name: "Mobilize", href: "/mc/mobilize", icon: Share2 },
  { name: "Reports", href: "/mc/reports", icon: PieChart },
  { name: "Sign", href: "/mc/sign", icon: FileSignature },
  { name: "PDF", href: "/mc/pdf", icon: FileText },
  { name: "Support", href: "/mc/support", icon: LifeBuoy },
];

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AppShell({ children, title, breadcrumbs }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50/50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 border-r border-zinc-200 bg-white">
        <div className="flex h-16 items-center px-6 border-b border-zinc-100">
          <Link href="/">
            <Logo className="scale-90 origin-left" />
          </Link>
        </div>
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                      : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100/50"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-300")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-zinc-100">
          <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-white shadow-sm">
                <AvatarFallback className="bg-white text-[10px] font-bold text-zinc-400">AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">Admin User</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Admin</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-xl border border-zinc-200 bg-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 border-r border-zinc-200">
                <div className="flex h-16 items-center px-6 border-b border-zinc-100">
                  <Logo className="scale-90 origin-left" />
                </div>
                <ScrollArea className="flex-1 px-4 py-6 h-[calc(100vh-4rem)]">
                  <nav className="space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
                            isActive 
                              ? "bg-zinc-900 text-white" 
                              : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <nav className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <Link href="/mc" className="hover:text-zinc-900 transition-colors">Mission Control</Link>
              {breadcrumbs?.map((crumb, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-zinc-200">/</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-zinc-900 transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-zinc-900">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search command center..." 
                className="h-9 w-64 pl-10 pr-4 text-[11px] font-medium rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-zinc-200 bg-white relative">
              <Bell className="h-4 w-4 text-zinc-600" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500 border border-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-zinc-200 bg-white overflow-hidden">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarFallback className="bg-white text-[10px] font-bold text-zinc-400">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-zinc-200 p-2 shadow-xl">
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Admin Account</p>
                  <p className="text-[10px] text-zinc-400 font-medium">admin@asymmetric.al</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-100" />
                <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-600 focus:bg-zinc-50 focus:text-zinc-900">
                  <User className="mr-3 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-600 focus:bg-zinc-50 focus:text-zinc-900">
                  <Settings className="mr-3 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-100" />
                <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-rose-600 focus:bg-rose-50 focus:text-rose-700">
                  <LogOut className="mr-3 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <DashboardFooter brandName="Asym" tagline="Mission Control" />
      </div>
    </div>
  );
}
