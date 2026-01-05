'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({ email: '', password: '' })
  
    async function handleDemoLogin(role: 'admin' | 'missionary' | 'donor') {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/auth/demo-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        
        const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      if (authError) throw authError
      
      // Ensure session is set and profile exists
      await supabase.auth.getSession()
      
      // Retry for profile if necessary (up to 3 times)
      let profile = null
      for (let i = 0; i < 3; i++) {
        const { data: p } = await supabase.from('profiles').select('role').single()
        if (p) {
          profile = p
          break
        }
        await new Promise(r => setTimeout(r, 500))
      }

      const target = role === 'admin' ? '/mc' : role === 'missionary' ? '/missionary-dashboard' : '/donor-dashboard'
      router.push(target)
      router.refresh()

      } catch (e: any) {
        setError(e.message)
        setLoading(false)
      }
    }

    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    if (authData.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', authData.user.id).single()
      if (profile?.role === 'admin' || profile?.role === 'staff') router.push('/mc')
      else if (profile?.role === 'missionary') router.push('/missionary-dashboard')
      else router.push('/donor-dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign In</Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or demo access</span>
            </div>
          </div>

            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" onClick={() => handleDemoLogin('admin')} disabled={loading} className="w-full">Mission Control (Admin Dashboard)</Button>
              <Button variant="outline" onClick={() => handleDemoLogin('missionary')} disabled={loading} className="w-full">Missionary Dashboard</Button>
              <Button variant="outline" onClick={() => handleDemoLogin('donor')} disabled={loading} className="w-full">Donor Portal</Button>
            </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Register</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
