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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { createBrowserClient } from "@asym/database/supabase";
import { Loader2, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoAvailability, setDemoAvailability] = useState({
    admin: false,
    missionary: false,
    donor: false,
  });
  const demoUnavailable =
    !demoAvailability.admin &&
    !demoAvailability.missionary &&
    !demoAvailability.donor;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });

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
          setDemoAvailability({
            admin: Boolean(data.availableRoles.admin),
            missionary: Boolean(data.availableRoles.missionary),
            donor: Boolean(data.availableRoles.donor),
          });
        }
      } catch {
        if (active) {
          setDemoAvailability({
            admin: false,
            missionary: false,
            donor: false,
          });
        }
      }
    }

    loadDemoAvailability();
    return () => {
      active = false;
    };
  }, []);

  async function handleDemoAccount(role: "admin" | "missionary" | "donor") {
    if (!demoAvailability[role]) {
      setError("Demo login unavailable");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/demo-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.ok !== true) {
        const message =
          data?.error ??
          (response.status === 401 || response.status === 403
            ? "Invalid demo credentials"
            : "Demo login unavailable");
        setError(message);
        return;
      }

      if (role === "admin") {
        router.push("/mc");
      } else if (role === "missionary") {
        router.push("/");
      } else {
        router.push("/donor-dashboard");
      }
    } catch {
      setError("Demo login unavailable");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.role) {
      setError("Please select a role");
      setLoading(false);
      return;
    }

    const supabase = createBrowserClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Profile is created automatically by database trigger
      if (formData.role === "admin" || formData.role === "staff") {
        router.push("/mc");
      } else if (formData.role === "missionary") {
        router.push("/");
      } else {
        router.push("/donor-dashboard");
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join asymmetric.al today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
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
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="missionary">Missionary</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or try a demo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoAccount("admin")}
                disabled={loading || !demoAvailability.admin}
                className="text-xs"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoAccount("missionary")}
                disabled={loading || !demoAvailability.missionary}
                className="text-xs"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Missionary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoAccount("donor")}
                disabled={loading || !demoAvailability.donor}
                className="text-xs"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Donor
              </Button>
            </div>
            {demoUnavailable && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Demo login unavailable.
              </p>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
