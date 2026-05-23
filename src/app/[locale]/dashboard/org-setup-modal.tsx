"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export function OrgSetupModal({ userId }: { userId: string }) {
  const [orgName, setOrgName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // If the flow completed successfully, unmount the modal client-side immediately
  // to prevent it from getting stuck during Next.js layout re-validation.
  if (isSuccess) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        throw new Error("Session expired. Please re-authenticate.")
      }

      // Generate UUID client-side to bypass Supabase SELECT RLS checks entirely
      const newOrgId = crypto.randomUUID()

      // Step 1: Create the organization entry
      const { error: orgError } = await supabase
        .from("organizations")
        .insert({ id: newOrgId, name: orgName })
      
      if (orgError) {
        throw new Error(`Failed to create workspace: ${orgError.message}`)
      }

      // Step 2: Update the profile with the generated organization identifier
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ organization_id: newOrgId })
        .eq("id", userId)

      if (profileError) {
        throw new Error(`Failed to update profile relation: ${profileError.message}`)
      }

      // Step 3: Clear the modal client-side and trigger a background refresh
      setIsSuccess(true)
      router.refresh()

    } catch (err: any) {
      console.error("Critical onboarding transaction failure:", err)
      setError(err.message || "An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">Setup Your Clinic</CardTitle>
          <CardDescription>
            Welcome to TryAssistly.AI! Please enter your organization name to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Clinic Name</Label>
              <Input
                id="orgName"
                placeholder="e.g. Apex Dental Care"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </div>
            
            {error && (
              <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20 text-center">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading || !orgName.trim()}>
              {loading ? "Setting up..." : "Continue to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
