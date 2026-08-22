/*
# SAARTHI AI — Full Database Schema

## Overview
Creates the complete multi-user schema for the SAARTHI AI accessibility platform.
Every table is owner-scoped via `user_id` with Row Level Security (RLS) policies
so each authenticated user can only access their own data.

## New Tables

1. **profiles** — User display name and avatar, 1:1 with auth.users
2. **accessibility_preferences** — Per-user a11y settings (font scale, contrast, etc.)
3. **website_analyses** — Saved website accessibility analyses (URL, score, summary)
4. **website_issues** — Issues found per analysis (severity, category, WCAG ref, recommendation)
5. **documents** — Uploaded document metadata + AI-extracted structured results
6. **chat_conversations** — Chatbot conversation sessions
7. **chat_messages** — Individual messages within a conversation
8. **activity_logs** — Unified activity feed for the History page

## Security
- RLS enabled on ALL tables.
- Each table has 4 owner-scoped policies (SELECT/INSERT/UPDATE/DELETE) using `auth.uid()`.
- `user_id` columns default to `auth.uid()` so client inserts omitting `user_id` succeed.
- Child tables (website_issues, chat_messages) scope through parent ownership.
- A trigger auto-creates a profile row when a new auth.users row is inserted.

## Important Notes
1. The `handle_new_user` trigger function creates a profile + default preferences on signup.
2. website_issues policies check ownership via the parent website_analyses table.
3. chat_messages policies check ownership via the parent chat_conversations table.
4. All timestamps use `timestamptz DEFAULT now()`.
*/

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profiles" ON profiles;
CREATE POLICY "select_own_profiles" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profiles" ON profiles;
CREATE POLICY "insert_own_profiles" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profiles" ON profiles;
CREATE POLICY "update_own_profiles" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profiles" ON profiles;
CREATE POLICY "delete_own_profiles" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================================
-- ACCESSIBILITY PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS accessibility_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  font_scale numeric NOT NULL DEFAULT 1.0,
  high_contrast boolean NOT NULL DEFAULT false,
  letter_spacing numeric NOT NULL DEFAULT 0,
  word_spacing numeric NOT NULL DEFAULT 0,
  line_height numeric NOT NULL DEFAULT 1.5,
  simple_language boolean NOT NULL DEFAULT false,
  large_controls boolean NOT NULL DEFAULT false,
  reduce_motion boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'en',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE accessibility_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_prefs" ON accessibility_preferences;
CREATE POLICY "select_own_prefs" ON accessibility_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_prefs" ON accessibility_preferences;
CREATE POLICY "insert_own_prefs" ON accessibility_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_prefs" ON accessibility_preferences;
CREATE POLICY "update_own_prefs" ON accessibility_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_prefs" ON accessibility_preferences;
CREATE POLICY "delete_own_prefs" ON accessibility_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- WEBSITE ANALYSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  summary text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE website_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON website_analyses;
CREATE POLICY "select_own_analyses" ON website_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON website_analyses;
CREATE POLICY "insert_own_analyses" ON website_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON website_analyses;
CREATE POLICY "update_own_analyses" ON website_analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON website_analyses;
CREATE POLICY "delete_own_analyses" ON website_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- WEBSITE ISSUES (child of website_analyses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS website_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES website_analyses(id) ON DELETE CASCADE,
  title text NOT NULL,
  severity text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  recommendation text NOT NULL,
  wcag text NOT NULL DEFAULT '',
  count integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_website_issues_analysis_id ON website_issues(analysis_id);

ALTER TABLE website_issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_issues" ON website_issues;
CREATE POLICY "select_own_issues" ON website_issues FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM website_analyses
      WHERE website_analyses.id = website_issues.analysis_id
      AND website_analyses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_issues" ON website_issues;
CREATE POLICY "insert_own_issues" ON website_issues FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM website_analyses
      WHERE website_analyses.id = website_issues.analysis_id
      AND website_analyses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_issues" ON website_issues;
CREATE POLICY "update_own_issues" ON website_issues FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM website_analyses
      WHERE website_analyses.id = website_issues.analysis_id
      AND website_analyses.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_issues" ON website_issues;
CREATE POLICY "delete_own_issues" ON website_issues FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM website_analyses
      WHERE website_analyses.id = website_issues.analysis_id
      AND website_analyses.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  important_dates jsonb NOT NULL DEFAULT '[]',
  eligibility jsonb NOT NULL DEFAULT '[]',
  required_documents jsonb NOT NULL DEFAULT '[]',
  important_info jsonb NOT NULL DEFAULT '[]',
  next_steps jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- CHAT CONVERSATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON chat_conversations;
CREATE POLICY "select_own_conversations" ON chat_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_conversations" ON chat_conversations;
CREATE POLICY "insert_own_conversations" ON chat_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_conversations" ON chat_conversations;
CREATE POLICY "update_own_conversations" ON chat_conversations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_conversations" ON chat_conversations;
CREATE POLICY "delete_own_conversations" ON chat_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- CHAT MESSAGES (child of chat_conversations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON chat_messages;
CREATE POLICY "select_own_messages" ON chat_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_messages" ON chat_messages;
CREATE POLICY "insert_own_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_messages" ON chat_messages;
CREATE POLICY "delete_own_messages" ON chat_messages FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ACTIVITY LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  score integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_logs" ON activity_logs;
CREATE POLICY "select_own_logs" ON activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_logs" ON activity_logs;
CREATE POLICY "insert_own_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_logs" ON activity_logs;
CREATE POLICY "delete_own_logs" ON activity_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER: Auto-create profile + preferences on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_website_analyses_user_id ON website_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS file_size bigint;

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created
  ON public.activity_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_website_analyses_user_created
  ON public.website_analyses (user_id, created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "users_manage_own_documents" ON storage.objects;

CREATE POLICY "users_manage_own_documents"
ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'user-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);