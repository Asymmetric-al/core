"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { createBrowserClient } from "@asym/database/supabase";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const demoRole = "missionary";
  const [demoAvailable, setDemoAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadDemoAvailability() {
      try {
        const response = await fetch("/api/auth/demo-account");
        if (!response.ok) {
          throw new Error("Demo status unavailable");
        }
        const data = await response.json();
        if (active && data?.availableRoles) {
          setDemoAvailable(Boolean(data.availableRoles[demoRole]));
        }
      } catch {
        if (active) {
          setDemoAvailable(false);
        }
      }
    }

    loadDemoAvailability();
    return () => {
      active = false;
    };
  }, []);

  async function handleDemoLogin() {
    if (!demoAvailable) {
      setError("Demo login unavailable");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: demoRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok !== true) {
        const message =
          data?.error ??
          (res.status === 401 || res.status === 403
            ? "Invalid demo credentials"
            : "Demo login unavailable");
        throw new Error(message);
      }

      router.push("/missionary-dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Demo login unavailable");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createBrowserClient();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", authData.user.id)
        .single();
      if (profile?.role === "admin" || profile?.role === "staff")
        router.push("/mc");
      else if (profile?.role === "missionary")
        router.push("/missionary-dashboard");
      else router.push("/donor-dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign
              In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or demo access
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={handleDemoLogin}
              disabled={loading || !demoAvailable}
              className="w-full"
            >
              Demo Access
            </Button>
          </div>
          {!demoAvailable && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Demo login unavailable.
            </p>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
