-- ==============================================================================
-- LeadPilot Multi-Tenant Row Level Security (RLS) Policies
-- Protects all 8 customer-facing tables:
-- 1. User
-- 2. Prospect
-- 3. ActivityLog
-- 4. ResearchReports
-- 5. OpportunityAnalysis
-- 6. Proposals
-- 7. OutreachMessages
-- 8. Subscriptions
-- ==============================================================================

-- 1. Enable and Force RLS on all 8 tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Prospect" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prospect" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ResearchReports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResearchReports" FORCE ROW LEVEL SECURITY;

ALTER TABLE "OpportunityAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OpportunityAnalysis" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Proposals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Proposals" FORCE ROW LEVEL SECURITY;

ALTER TABLE "OutreachMessages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OutreachMessages" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscriptions" FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. User Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_tenant_select" ON "User";
DROP POLICY IF EXISTS "user_tenant_insert" ON "User";
DROP POLICY IF EXISTS "user_tenant_update" ON "User";
DROP POLICY IF EXISTS "user_tenant_delete" ON "User";

CREATE POLICY "user_tenant_select" ON "User"
  FOR SELECT
  USING (
    id = NULLIF(current_setting('app.current_user_id', true), '')
    OR id = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "user_tenant_insert" ON "User"
  FOR INSERT
  WITH CHECK (
    id = NULLIF(current_setting('app.current_user_id', true), '')
    OR id = auth.uid()::text
    OR NULLIF(current_setting('app.current_user_id', true), '') IS NULL
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "user_tenant_update" ON "User"
  FOR UPDATE
  USING (
    id = NULLIF(current_setting('app.current_user_id', true), '')
    OR id = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    id = NULLIF(current_setting('app.current_user_id', true), '')
    OR id = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "user_tenant_delete" ON "User"
  FOR DELETE
  USING (
    id = NULLIF(current_setting('app.current_user_id', true), '')
    OR id = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

-- ------------------------------------------------------------------------------
-- 3. Prospect Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "prospect_tenant_select" ON "Prospect";
DROP POLICY IF EXISTS "prospect_tenant_insert" ON "Prospect";
DROP POLICY IF EXISTS "prospect_tenant_update" ON "Prospect";
DROP POLICY IF EXISTS "prospect_tenant_delete" ON "Prospect";

CREATE POLICY "prospect_tenant_select" ON "Prospect"
  FOR SELECT
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "prospect_tenant_insert" ON "Prospect"
  FOR INSERT
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "prospect_tenant_update" ON "Prospect"
  FOR UPDATE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "prospect_tenant_delete" ON "Prospect"
  FOR DELETE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

-- ------------------------------------------------------------------------------
-- 4. ActivityLog Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "activity_tenant_select" ON "ActivityLog";
DROP POLICY IF EXISTS "activity_tenant_insert" ON "ActivityLog";
DROP POLICY IF EXISTS "activity_tenant_update" ON "ActivityLog";
DROP POLICY IF EXISTS "activity_tenant_delete" ON "ActivityLog";

CREATE POLICY "activity_tenant_select" ON "ActivityLog"
  FOR SELECT
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "activity_tenant_insert" ON "ActivityLog"
  FOR INSERT
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "activity_tenant_update" ON "ActivityLog"
  FOR UPDATE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "activity_tenant_delete" ON "ActivityLog"
  FOR DELETE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

-- ------------------------------------------------------------------------------
-- 5. ResearchReports Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "research_tenant_select" ON "ResearchReports";
DROP POLICY IF EXISTS "research_tenant_insert" ON "ResearchReports";
DROP POLICY IF EXISTS "research_tenant_update" ON "ResearchReports";
DROP POLICY IF EXISTS "research_tenant_delete" ON "ResearchReports";

CREATE POLICY "research_tenant_select" ON "ResearchReports"
  FOR SELECT
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "research_tenant_insert" ON "ResearchReports"
  FOR INSERT
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "research_tenant_update" ON "ResearchReports"
  FOR UPDATE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "research_tenant_delete" ON "ResearchReports"
  FOR DELETE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

-- ------------------------------------------------------------------------------
-- 6. OpportunityAnalysis Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "opportunity_tenant_select" ON "OpportunityAnalysis";
DROP POLICY IF EXISTS "opportunity_tenant_insert" ON "OpportunityAnalysis";
DROP POLICY IF EXISTS "opportunity_tenant_update" ON "OpportunityAnalysis";
DROP POLICY IF EXISTS "opportunity_tenant_delete" ON "OpportunityAnalysis";

CREATE POLICY "opportunity_tenant_select" ON "OpportunityAnalysis"
  FOR SELECT
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "opportunity_tenant_insert" ON "OpportunityAnalysis"
  FOR INSERT
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "opportunity_tenant_update" ON "OpportunityAnalysis"
  FOR UPDATE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "opportunity_tenant_delete" ON "OpportunityAnalysis"
  FOR DELETE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

-- ------------------------------------------------------------------------------
-- 7. Proposals Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "proposal_tenant_select" ON "Proposals";
DROP POLICY IF EXISTS "proposal_tenant_insert" ON "Proposals";
DROP POLICY IF EXISTS "proposal_tenant_update" ON "Proposals";
DROP POLICY IF EXISTS "proposal_tenant_delete" ON "Proposals";

CREATE POLICY "proposal_tenant_select" ON "Proposals"
  FOR SELECT
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "proposal_tenant_insert" ON "Proposals"
  FOR INSERT
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "proposal_tenant_update" ON "Proposals"
  FOR UPDATE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "proposal_tenant_delete" ON "Proposals"
  FOR DELETE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

-- ------------------------------------------------------------------------------
-- 8. OutreachMessages Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "outreach_tenant_select" ON "OutreachMessages";
DROP POLICY IF EXISTS "outreach_tenant_insert" ON "OutreachMessages";
DROP POLICY IF EXISTS "outreach_tenant_update" ON "OutreachMessages";
DROP POLICY IF EXISTS "outreach_tenant_delete" ON "OutreachMessages";

CREATE POLICY "outreach_tenant_select" ON "OutreachMessages"
  FOR SELECT
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "outreach_tenant_insert" ON "OutreachMessages"
  FOR INSERT
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "outreach_tenant_update" ON "OutreachMessages"
  FOR UPDATE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "outreach_tenant_delete" ON "OutreachMessages"
  FOR DELETE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

-- ------------------------------------------------------------------------------
-- 9. Subscriptions Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "subscription_tenant_select" ON "Subscriptions";
DROP POLICY IF EXISTS "subscription_tenant_insert" ON "Subscriptions";
DROP POLICY IF EXISTS "subscription_tenant_update" ON "Subscriptions";
DROP POLICY IF EXISTS "subscription_tenant_delete" ON "Subscriptions";

CREATE POLICY "subscription_tenant_select" ON "Subscriptions"
  FOR SELECT
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "subscription_tenant_insert" ON "Subscriptions"
  FOR INSERT
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "subscription_tenant_update" ON "Subscriptions"
  FOR UPDATE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  )
  WITH CHECK (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );

CREATE POLICY "subscription_tenant_delete" ON "Subscriptions"
  FOR DELETE
  USING (
    "userId" = NULLIF(current_setting('app.current_user_id', true), '')
    OR "userId" = auth.uid()::text
    OR NULLIF(current_setting('app.is_admin', true), '') = 'true'
  );
