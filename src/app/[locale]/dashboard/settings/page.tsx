"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Webhook, Copy, Check, Save, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react"

export default function SettingsPage() {
  const supabase = createClient()

  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [whatsappAccessToken, setWhatsappAccessToken] = useState("")
  const [whatsappPhoneId, setWhatsappPhoneId] = useState("")
  const [whatsappVerifyToken, setWhatsappVerifyToken] = useState("")
  const [geminiApiKey, setGeminiApiKey] = useState("")

  // Visibility toggles for each field
  const [showFields, setShowFields] = useState({
    whatsappAccessToken: false,
    whatsappPhoneId: false,
    whatsappVerifyToken: false,
    geminiApiKey: false,
  })

  // Fetch current organization data on mount
  useEffect(() => {
    async function loadOrgData() {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to view settings.")
        setLoading(false)
        return
      }

      // Get the user's profile to find their org
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single()

      if (!profile?.organization_id) {
        setError("No organization found. Please set up your organization first.")
        setLoading(false)
        return
      }

      setOrgId(profile.organization_id)

      // Fetch org data
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("whatsapp_access_token, whatsapp_phone_id, whatsapp_verify_token, gemini_api_key")
        .eq("id", profile.organization_id)
        .single()

      if (orgError) {
        setError("Failed to load organization data.")
        setLoading(false)
        return
      }

      if (org) {
        setWhatsappAccessToken(org.whatsapp_access_token || "")
        setWhatsappPhoneId(org.whatsapp_phone_id || "")
        setWhatsappVerifyToken(org.whatsapp_verify_token || "")
        setGeminiApiKey(org.gemini_api_key || "")
      }

      setLoading(false)
    }

    loadOrgData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    if (!orgId) return
    setSaving(true)
    setSaved(false)
    setError(null)

    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        whatsapp_access_token: whatsappAccessToken || null,
        whatsapp_phone_id: whatsappPhoneId || null,
        whatsapp_verify_token: whatsappVerifyToken || null,
        gemini_api_key: geminiApiKey || null,
      })
      .eq("id", orgId)

    if (updateError) {
      setError("Failed to save settings. Please try again.")
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const webhookUrl = orgId
    ? `https://api.tryassistly.ai/webhook/${orgId}`
    : "https://api.tryassistly.ai/webhook/..."

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleVisibility = (field: keyof typeof showFields) => {
    setShowFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your API integrations and webhook configuration.</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* ── Integrations Form ── */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-serif">API Integrations</CardTitle>
                <CardDescription>Connect your WhatsApp Business and Gemini AI credentials.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WhatsApp Access Token */}
            <div className="space-y-2">
              <Label htmlFor="wa-token" className="text-sm font-medium">Meta WhatsApp Access Token</Label>
              <div className="relative">
                <Input
                  id="wa-token"
                  type={showFields.whatsappAccessToken ? "text" : "password"}
                  value={whatsappAccessToken}
                  onChange={(e) => setWhatsappAccessToken(e.target.value)}
                  placeholder="EAAxxxxxxxxxxxxxxx..."
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("whatsappAccessToken")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showFields.whatsappAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Found in Meta Business Manager → System Users → Generate Token</p>
            </div>

            {/* WhatsApp Phone Number ID */}
            <div className="space-y-2">
              <Label htmlFor="wa-phone" className="text-sm font-medium">WhatsApp Phone Number ID</Label>
              <div className="relative">
                <Input
                  id="wa-phone"
                  type={showFields.whatsappPhoneId ? "text" : "password"}
                  value={whatsappPhoneId}
                  onChange={(e) => setWhatsappPhoneId(e.target.value)}
                  placeholder="1234567890..."
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("whatsappPhoneId")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showFields.whatsappPhoneId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Found in Meta App Dashboard → WhatsApp → API Setup</p>
            </div>

            {/* WhatsApp Verify Token */}
            <div className="space-y-2">
              <Label htmlFor="wa-verify" className="text-sm font-medium">WhatsApp Verify Token</Label>
              <div className="relative">
                <Input
                  id="wa-verify"
                  type={showFields.whatsappVerifyToken ? "text" : "password"}
                  value={whatsappVerifyToken}
                  onChange={(e) => setWhatsappVerifyToken(e.target.value)}
                  placeholder="my-custom-verify-token"
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("whatsappVerifyToken")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showFields.whatsappVerifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">A custom string you invent. Must match the token in your Meta webhook config.</p>
            </div>

            {/* Gemini API Key */}
            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="text-sm font-medium">Google Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showFields.geminiApiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaxxxxxxxxxxxxxxxxx..."
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("geminiApiKey")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showFields.geminiApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get yours at{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !orgId} className="gap-2">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Integrations"}
              </Button>
              {saved && (
                <span className="text-sm text-green-600 dark:text-green-400">Settings updated successfully.</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Webhook Configuration (Read-Only) ── */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Webhook className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-serif">Webhook Configuration</CardTitle>
                <CardDescription>Use these details to connect Meta WhatsApp to your TryAssistly.AI instance.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Webhook URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Webhook URL</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-2.5 rounded-lg bg-muted border border-border font-mono text-sm truncate select-all">
                  {webhookUrl}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Setup Instructions</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Go to your <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta Developer Dashboard</a> → Your App → WhatsApp → Configuration.</li>
                <li>In the <strong>Callback URL</strong> field, paste the Webhook URL shown above.</li>
                <li>In the <strong>Verify Token</strong> field, paste the exact custom Verify Token you entered in the form above.</li>
                <li>Click <strong>Verify and Save</strong>. Meta will send a verification request to your server.</li>
                <li>Subscribe to the <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mx-0.5">messages</Badge> webhook field to start receiving incoming messages.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
