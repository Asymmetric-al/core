import Link from "next/link";

const settingsNav = [
  { label: "Appearance", href: "/settings" },
  { label: "Integrations", href: "/settings/integrations/sendgrid" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="border-b bg-background px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex h-14 items-center gap-1">
            <h1 className="text-sm font-bold uppercase tracking-widest text-foreground mr-6">
              Settings
            </h1>
            <nav className="flex items-center gap-1">
              {settingsNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-muted/50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
