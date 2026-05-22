-- ============================================================
-- Lead-Flow-AI: Fix Missing RLS Policies for Organizations
-- Migration: 00003_fix_org_rls_policies.sql
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Allow any authenticated user to create a new organization
-- (needed for the org-setup-modal during first-time setup)
CREATE POLICY "Users can create organizations"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow organization members to update their organization
-- (needed for the Settings page to save BYOK API keys)
CREATE POLICY "Users can update their organization"
  ON public.organizations
  FOR UPDATE
  USING (
    id IN (SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid())
  )
  WITH CHECK (
    id IN (SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid())
  );
