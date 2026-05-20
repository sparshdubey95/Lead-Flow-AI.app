import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { OrgSetupModal } from "./org-setup-modal"
import Link from "next/link"
import { ModeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, full_name, role")
    .eq("id", user.id)
    .single()

  const needsOrgSetup = !profile?.organization_id

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Dashboard Navbar */}
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">L</span>
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">LeadGate.AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              Welcome, {profile?.full_name || user.email}
            </span>
            <ModeToggle />
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" size="sm">Sign out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-serif font-medium">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your AI receptionist and missed call recovery here.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/50 bg-white/40 dark:bg-black/40 backdrop-blur-sm shadow-sm">
              <h3 className="font-medium text-lg">Missed Calls Recovered</h3>
              <p className="text-4xl font-serif mt-4">0</p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-white/40 dark:bg-black/40 backdrop-blur-sm shadow-sm">
              <h3 className="font-medium text-lg">Active Conversations</h3>
              <p className="text-4xl font-serif mt-4">0</p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-white/40 dark:bg-black/40 backdrop-blur-sm shadow-sm">
              <h3 className="font-medium text-lg">Appointments Booked</h3>
              <p className="text-4xl font-serif mt-4">0</p>
            </div>
          </div>
        </div>
      </main>

      {/* Conditionally render setup modal if no org exists */}
      {needsOrgSetup && <OrgSetupModal userId={user.id} />}
    </div>
  )
}
