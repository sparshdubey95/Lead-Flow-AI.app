import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { OrgSetupModal } from '../org-setup-modal';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
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

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-background">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic preferences, metadata models, and team channels.</p>
      </div>

      <SettingsForm initialOrg={org} />
    </div>
  );
}
