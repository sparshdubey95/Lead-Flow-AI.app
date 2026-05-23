import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { InboxClient } from './inbox-client';
import { OrgSetupModal } from './org-setup-modal';

// ──────────────────────────────────────────────
// Types shared between RSC → Client
// ──────────────────────────────────────────────

export interface Lead {
  id: string;
  organization_id: string;
  phone_number: string;
  name: string | null;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string | null;
  messages: Message[];
}

export interface Message {
  id: string;
  lead_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  is_ai_generated: boolean;
  created_at: string;
}

// ──────────────────────────────────────────────
// Server Component — fast initial data fetch
// ──────────────────────────────────────────────

export default async function InboxPage() {
  const supabase = await createClient();

  // 1. Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    redirect('/en/login');
  }

  // 2. Get user's profile → organization_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single();

  // 3. If no organization, show the setup modal
  if (!profile?.organization_id) {
    return <OrgSetupModal />;
  }

  const orgId = profile.organization_id;

  // 4. Fetch leads with their latest messages (server-side, fast)
  const { data: leadsRaw } = await supabase
    .from('leads')
    .select(`
      id,
      organization_id,
      phone_number,
      name,
      status,
      tags,
      created_at,
      updated_at,
      messages (
        id,
        lead_id,
        direction,
        content,
        is_ai_generated,
        created_at
      )
    `)
    .eq('organization_id', orgId)
    .order('updated_at', { ascending: false });

  // Sort messages within each lead by created_at ascending
  const leads: Lead[] = (leadsRaw || []).map(lead => ({
    ...lead,
    tags: lead.tags || [],
    messages: (lead.messages || []).sort(
      (a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }));

  // 5. Pass to client component for interactivity + realtime
  return (
    <InboxClient
      initialLeads={leads}
      organizationId={orgId}
      userId={user.id}
    />
  );
}
