import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { OrgSetupModal } from '../org-setup-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default async function FollowUpsPage() {
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

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-background">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Follow-up Sequences</h1>
        <p className="text-muted-foreground">Automated scheduling pipelines and reminders.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Scheduled Reminders</CardTitle>
          <CardDescription>Upcoming interactions pending manual action or AI dispatch.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
            <CalendarIcon className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No upcoming follow-ups scheduled.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
