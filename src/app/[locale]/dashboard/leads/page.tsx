import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { OrgSetupModal } from '../org-setup-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Phone, Calendar as CalendarIcon, Tag } from 'lucide-react';

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) redirect('/en/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) {
    return <OrgSetupModal userId={user.id} />;
  }

  // Fetch leads belonging strictly to this organization
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-background">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Leads Management</h1>
        <p className="text-muted-foreground">Track and manage your customer inbound channels.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>A real-time overview of contacts gathered via WhatsApp automation.</CardDescription>
        </CardHeader>
        <CardContent>
          {!leads || leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
              <Users className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No leads found yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border border rounded-lg overflow-hidden bg-card">
              {leads.map((lead: any) => (
                <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {lead.name || "Anonymous Prospect"}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                        lead.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {lead.phone_number}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center sm:justify-end">
                    {lead.tags?.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded border">
                        <Tag className="h-2.5 w-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
