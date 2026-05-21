-- ============================================================
-- Lead-Flow-AI: Multi-Tenant Schema Expansion
-- Migration: 00002_leads_messages_byok.sql
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. REUSABLE: updated_at TRIGGER FUNCTION
-- ──────────────────────────────────────────────
-- A single function reused by every table that needs
-- an automatically-maintained updated_at column.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ──────────────────────────────────────────────
-- 2. ORGANIZATIONS TABLE — BYOK & Billing Columns
-- ──────────────────────────────────────────────
-- Add Bring-Your-Own-Key columns so each clinic
-- can plug in their own WhatsApp + Gemini credentials.

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_id     TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_verify_token TEXT,
  ADD COLUMN IF NOT EXISTS gemini_api_key        TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier     TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_ends_at         TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Auto-update updated_at on organizations
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ──────────────────────────────────────────────
-- 3. LEADS TABLE
-- ──────────────────────────────────────────────

CREATE TABLE public.leads (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone_number     TEXT NOT NULL,
  name             TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  tags             TEXT[] DEFAULT '{}',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),

  -- A phone number must be unique within an organization
  CONSTRAINT leads_org_phone_unique UNIQUE (organization_id, phone_number)
);

-- Index for fast lookups by org
CREATE INDEX idx_leads_organization_id ON public.leads(organization_id);

-- Auto-update updated_at on leads
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ──────────────────────────────────────────────
-- 4. MESSAGES TABLE
-- ──────────────────────────────────────────────

CREATE TABLE public.messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id         UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content         TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookups by lead
CREATE INDEX idx_messages_lead_id ON public.messages(lead_id);

-- Index for chronological ordering within a conversation
CREATE INDEX idx_messages_lead_created ON public.messages(lead_id, created_at);


-- ──────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY — LEADS
-- ──────────────────────────────────────────────

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Helper: Get the current user's organization_id
-- Used in every policy below to enforce tenant isolation.

-- SELECT: Users can only view leads belonging to their org
CREATE POLICY "leads_select_own_org" ON public.leads
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- INSERT: Users can only create leads in their own org
CREATE POLICY "leads_insert_own_org" ON public.leads
  FOR INSERT WITH CHECK (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- UPDATE: Users can only update leads in their own org
CREATE POLICY "leads_update_own_org" ON public.leads
  FOR UPDATE USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- DELETE: Users can only delete leads in their own org
CREATE POLICY "leads_delete_own_org" ON public.leads
  FOR DELETE USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );


-- ──────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY — MESSAGES
-- ──────────────────────────────────────────────

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages inherit tenant isolation through the lead they belong to.
-- A user can only access messages whose lead belongs to their org.

-- SELECT
CREATE POLICY "messages_select_own_org" ON public.messages
  FOR SELECT USING (
    lead_id IN (
      SELECT id FROM public.leads
      WHERE organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- INSERT
CREATE POLICY "messages_insert_own_org" ON public.messages
  FOR INSERT WITH CHECK (
    lead_id IN (
      SELECT id FROM public.leads
      WHERE organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- UPDATE
CREATE POLICY "messages_update_own_org" ON public.messages
  FOR UPDATE USING (
    lead_id IN (
      SELECT id FROM public.leads
      WHERE organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- DELETE
CREATE POLICY "messages_delete_own_org" ON public.messages
  FOR DELETE USING (
    lead_id IN (
      SELECT id FROM public.leads
      WHERE organization_id = (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );


-- ──────────────────────────────────────────────
-- 7. SERVICE ROLE BYPASS (for the webhook server)
-- ──────────────────────────────────────────────
-- The Express webhook server uses the Supabase SERVICE_ROLE key,
-- which automatically bypasses RLS. No extra policies needed for it.
-- This comment is here for documentation purposes.

-- ============================================================
-- DONE. Your schema now supports:
--   ✅ Multi-tenant BYOK credentials per organization
--   ✅ Subscription tiers & trial tracking
--   ✅ Leads with per-org unique phone numbers & tags
--   ✅ Messages with direction tracking & AI attribution
--   ✅ Full RLS isolation — users only see their org's data
--   ✅ Automatic updated_at timestamps
-- ============================================================
