-- GoalDigger schema for Neon PostgreSQL
-- Run this in your Neon SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Goals table
DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS goals;

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  value NUMERIC,
  count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(goal_id, date)
);

-- Indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_entries_goal_id ON entries(goal_id);
CREATE INDEX idx_entries_goal_date ON entries(goal_id, date);
