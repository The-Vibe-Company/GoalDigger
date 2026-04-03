-- GoalDigger schema for Neon PostgreSQL
-- Run this in your Neon SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.user_id(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('curve', 'counter')),
  unit TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Hash',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  target NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entries table (shared for curve + counter)
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC,   -- used by curve goals
  count INTEGER,   -- used by counter goals
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(goal_id, date)
);

-- Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Goals: users can only access their own goals
CREATE POLICY goals_select ON goals FOR SELECT USING (user_id = auth.user_id());
CREATE POLICY goals_insert ON goals FOR INSERT WITH CHECK (user_id = auth.user_id());
CREATE POLICY goals_update ON goals FOR UPDATE USING (user_id = auth.user_id());
CREATE POLICY goals_delete ON goals FOR DELETE USING (user_id = auth.user_id());

-- Entries: users can only access entries for their own goals
CREATE POLICY entries_select ON entries FOR SELECT
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.user_id()));
CREATE POLICY entries_insert ON entries FOR INSERT
  WITH CHECK (goal_id IN (SELECT id FROM goals WHERE user_id = auth.user_id()));
CREATE POLICY entries_update ON entries FOR UPDATE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.user_id()));
CREATE POLICY entries_delete ON entries FOR DELETE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.user_id()));

-- Indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_entries_goal_id ON entries(goal_id);
CREATE INDEX idx_entries_goal_date ON entries(goal_id, date);
