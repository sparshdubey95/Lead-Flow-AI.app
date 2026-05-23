-- ============================================================
-- Lead-Flow-AI: Performance Optimization Indexes
-- Migration: 00004_add_indexes.sql
-- Run this in the Supabase SQL Editor
-- ============================================================

-- NOTE: idx_leads_organization_id and idx_messages_lead_id
-- already exist from 00002_leads_messages_byok.sql.
-- This migration adds supplementary indexes for common queries.

-- ──────────────────────────────────────────────
-- 1. LEADS: Composite index for org + updated_at
-- Used by the dashboard to fetch leads sorted by recency
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_org_updated
  ON public.leads(organization_id, updated_at DESC);

-- ──────────────────────────────────────────────
-- 2. LEADS: Index on status for filtering active/archived
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_org_status
  ON public.leads(organization_id, status);

-- ──────────────────────────────────────────────
-- 3. MESSAGES: Composite index for lead + created_at DESC
-- Optimizes fetching the latest message per lead
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_lead_created_desc
  ON public.messages(lead_id, created_at DESC);

-- ──────────────────────────────────────────────
-- 4. PROFILES: Index on organization_id
-- Used by RLS policies (subquery in every policy check)
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id
  ON public.profiles(organization_id);

-- ──────────────────────────────────────────────
-- 5. ORGANIZATIONS: Enable Realtime
-- Required for Supabase Realtime subscriptions
-- ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- ============================================================
-- DONE. Added:
--   ✅ Composite index for leads sorted by recency per org
--   ✅ Composite index for leads filtered by status per org
--   ✅ DESC index on messages for efficient latest-message queries
--   ✅ Index on profiles.organization_id (speeds up RLS checks)
--   ✅ Enabled Realtime for messages and leads tables
-- ============================================================
