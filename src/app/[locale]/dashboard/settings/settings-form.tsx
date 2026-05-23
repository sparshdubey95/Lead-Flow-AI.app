"use client"

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function SettingsForm({ initialOrg }: { initialOrg: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initialOrg?.name || '');
  const [type, setType] = useState(initialOrg?.type || 'Clinic');
  
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const { error: updateError } = await supabase
      .from('organizations')
      .update({ name, type })
      .eq('id', initialOrg.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-serif">
            <Building2 className="h-5 w-5 text-primary" />
            Organization Profile
          </CardTitle>
          <CardDescription>
            Configure your workspace details and company classification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input 
              id="org-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="org-type">Organization Type / Industry</Label>
            <select
              id="org-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Clinic">Medical / Dental Clinic</option>
              <option value="SaaS">Software / SaaS Development</option>
              <option value="Agency">Marketing or Creative Agency</option>
              <option value="Ecommerce">E-Commerce Retailing</option>
              <option value="Legal">Legal or Financial Services</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Current Tier: <span className="font-bold text-foreground uppercase">{initialOrg?.tier || 'Free'}</span>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-sm text-destructive font-medium">{error}</span>}
            {success && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Changes saved successfully!
              </span>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving settings..." : "Save Workspace"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
