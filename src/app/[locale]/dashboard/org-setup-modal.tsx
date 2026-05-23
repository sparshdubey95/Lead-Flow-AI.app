"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function OrgSetupModal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Hydrate the session to ensure cookies/tokens are actively synced
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("No active session found. Please refresh the page or log in again.");
      }

      const user = session.user;

      // 2. Insert the Organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: orgName }])
        .select('id')
        .single();

      if (orgError) {
        console.error("Organizations Insert Error:", orgError);
        throw new Error(`Failed to create organization: ${orgError.message} (Details: ${orgError.details || 'None'})`);
      }

      if (!orgData?.id) {
        throw new Error("Organization created but no ID was returned.");
      }

      // 3. Update the Profile to link the Organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: orgData.id })
        .eq('id', user.id);

      if (profileError) {
        console.error("Profiles Update Error:", profileError);
        throw new Error(`Failed to link profile: ${profileError.message} (Details: ${profileError.details || 'None'})`);
      }

      // 4. Force Next.js Layout to Re-fetch Data
      // This is what makes the modal disappear!
      router.refresh();

    } catch (err: any) {
      console.error("Setup Flow Exception:", err);
      setError(err.message || "An unexpected error occurred during setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Setup your Organization</DialogTitle>
          <DialogDescription>
            Create your company workspace to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              placeholder="e.g. Acme Corp"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading || !orgName.trim()}>
            {loading ? "Creating workspace..." : "Create Organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
