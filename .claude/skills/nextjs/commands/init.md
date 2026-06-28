# Init Next.js Project

Scaffold a new Next.js 16 project with App Router, TypeScript, and Tailwind CSS.

---

## Your Task

Follow these steps to create a new Next.js project.

### 1. Gather Project Details

Ask the user for:

- **Project name**
- **Features**: Tailwind CSS, shadcn/ui, authentication
- **Deployment target**: Vercel, Cloudflare, self-hosted

Defaults:

- Name: "my-nextjs-app"
- Features: Tailwind CSS + shadcn/ui
- Deployment: Vercel

### 2. Create Project

```bash
npx create-next-app@latest <project-name> \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd <project-name>
```

### 3. Install Additional Dependencies

```bash
# shadcn/ui (if selected)
npx shadcn@latest init

# Recommended utilities
npm install clsx tailwind-merge
```

### 4. Create Utility Functions

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5. Configure for App Router

Ensure `src/app/layout.tsx` has:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '<Project Name>',
  description: 'Built with Next.js 16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 6. Create Example Page

Update `src/app/page.tsx`:

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to <Project Name></h1>
      <p className="mt-4 text-muted-foreground">
        Built with Next.js 16 + App Router
      </p>
    </main>
  );
}
```

### 7. Configure for Deployment Target

**For Vercel** (default - no changes needed):

```bash
# Deploy
npx vercel
```

**For Cloudflare Pages:**

```bash
npm install @cloudflare/next-on-pages
```

Add to `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Cloudflare Pages
  experimental: {
    runtime: "edge",
  },
};

export default nextConfig;
```

### 8. Set Up Environment Variables

Create `.env.local`:

```bash
# Add your environment variables here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Create `.env.example`:

```bash
NEXT_PUBLIC_APP_URL=
```

### 9. Update .gitignore

Ensure these are ignored:

```
.env*.local
.vercel
.next
node_modules
```

### 10. Provide Next Steps

```
✅ Next.js 16 project "<project-name>" created!

📁 Structure:
   - src/app/           (App Router pages)
   - src/components/    (UI components)
   - src/lib/           (Utilities)

🚀 Next steps:
   1. npm run dev       (Start development)
   2. Add pages in src/app/
   3. Add components with: npx shadcn@latest add <component>

📦 Key Features:
   - App Router with async params (Next.js 16)
   - React 19.2 with Server Components
   - Tailwind CSS v4 (if configured)
   - TypeScript strict mode

📚 Skill loaded: nextjs
   - Async route params pattern
   - "use cache" directive support
   - Server Actions ready
```

---

## Next.js 16 Key Patterns

1. **Async route params**: `params` and `searchParams` are now Promises
2. **Cache Components**: Use `"use cache"` directive for caching
3. **proxy.ts**: New Clerk middleware filename (from middleware.ts)
4. **React 19.2**: useActionState, use() hook, Server Components
