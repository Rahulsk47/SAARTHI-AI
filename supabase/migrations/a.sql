/*
# SAARTHI AI - Initial Database Schema

## Overview
Full schema for the SAARTHI AI accessibility platform.

## New Tables

### profiles
- id (uuid, PK, references auth.users)
- full_name (text)
- email (text)
- avatar_url (text)
- preferred_language (text, default 'en')
- created_at, updated_at (timestamps)

### accessibility_profiles
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- font_size (text: small/medium/large/xl)
- contrast_mode (text: normal/high/inverted)
- reduce_motion (boolean)
- simple_language (boolean)
- step_by_step_mode (boolean)
- voice_navigation (boolean)
- keyboard_first (boolean)
- preferred_language (text)
- created_at, updated_at

### user_preferences
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- interaction_mode (text: voice/text/keyboard/touch)
- accessibility_needs (text[])
- onboarding_completed (boolean)
- created_at, updated_at

### website_analyses
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- url (text)
- title (text)
- status (text: pending/analyzing/completed/failed)
- accessibility_score (integer)
- critical_count (integer)
- warning_count (integer)
- suggestion_count (integer)
- ai_summary (text)
- screenshot_url (text)
- created_at, updated_at

### website_issues
- id (uuid, PK)
- analysis_id (uuid, FK to website_analyses)
- user_id (uuid, FK to auth.users)
- severity (text: critical/warning/suggestion)
- category (text)
- title (text)
- technical_desc (text)
- human_desc (text)
- recommendation (text)
- affected_element (text)
- wcag_criterion (text)

### accessible_views
- id (uuid, PK)
- analysis_id (uuid, FK to website_analyses)
- user_id (uuid, FK to auth.users)
- content (text)
- generated_at (timestamp)

### documents
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- title (text)
- file_name (text)
- file_url (text)
- file_type (text)
- status (text: uploading/processing/completed/failed)
- summary (text)
- simplified_content (text)
- document_type (text)
- important_dates (jsonb)
- next_steps (jsonb)
- eligibility (text)
- required_docs (text[])
- created_at, updated_at

### document_conversations
- id (uuid, PK)
- document_id (uuid, FK to documents)
- user_id (uuid, FK to auth.users)
- role (text: user/assistant)
- content (text)
- created_at

### voice_sessions
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- transcript (text)
- ai_response (text)
- language (text)
- duration_seconds (integer)
- created_at

### language_sessions
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- original_text (text)
- result_text (text)
- source_language (text)
- target_language (text)
- mode (text: translate/simplify/both)
- created_at

### activity_logs
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- activity_type (text)
- title (text)
- description (text)
- metadata (jsonb)
- created_at

## Security
- RLS enabled on all tables
- Owner-scoped policies for authenticated users
- All tables use DEFAULT auth.uid() for user_id
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  preferred_language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- ACCESSIBILITY PROFILES
CREATE TABLE IF NOT EXISTS accessibility_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  font_size text NOT NULL DEFAULT 'medium',
  contrast_mode text NOT NULL DEFAULT 'normal',
  reduce_motion boolean NOT NULL DEFAULT false,
  simple_language boolean NOT NULL DEFAULT false,
  step_by_step_mode boolean NOT NULL DEFAULT false,
  voice_navigation boolean NOT NULL DEFAULT false,
  keyboard_first boolean NOT NULL DEFAULT false,
  preferred_language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accessibility_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_accessibility" ON accessibility_profiles;
CREATE POLICY "select_own_accessibility" ON accessibility_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_accessibility" ON accessibility_profiles;
CREATE POLICY "insert_own_accessibility" ON accessibility_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_accessibility" ON accessibility_profiles;
CREATE POLICY "update_own_accessibility" ON accessibility_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_accessibility" ON accessibility_profiles;
CREATE POLICY "delete_own_accessibility" ON accessibility_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  interaction_mode text DEFAULT 'text',
  accessibility_needs text[] DEFAULT '{}',
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_prefs" ON user_preferences;
CREATE POLICY "select_own_prefs" ON user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_prefs" ON user_preferences;
CREATE POLICY "insert_own_prefs" ON user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_prefs" ON user_preferences;
CREATE POLICY "update_own_prefs" ON user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_prefs" ON user_preferences;
CREATE POLICY "delete_own_prefs" ON user_preferences FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- WEBSITE ANALYSES
CREATE TABLE IF NOT EXISTS website_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'pending',
  accessibility_score integer,
  critical_count integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  suggestion_count integer DEFAULT 0,
  ai_summary text,
  screenshot_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_website_analyses_user ON website_analyses(user_id);
ALTER TABLE website_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON website_analyses;
CREATE POLICY "select_own_analyses" ON website_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_analyses" ON website_analyses;
CREATE POLICY "insert_own_analyses" ON website_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_analyses" ON website_analyses;
CREATE POLICY "update_own_analyses" ON website_analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_analyses" ON website_analyses;
CREATE POLICY "delete_own_analyses" ON website_analyses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- WEBSITE ISSUES
CREATE TABLE IF NOT EXISTS website_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES website_analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  severity text NOT NULL DEFAULT 'warning',
  category text,
  title text NOT NULL,
  technical_desc text,
  human_desc text,
  recommendation text,
  affected_element text,
  wcag_criterion text
);

CREATE INDEX IF NOT EXISTS idx_website_issues_analysis ON website_issues(analysis_id);
ALTER TABLE website_issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_issues" ON website_issues;
CREATE POLICY "select_own_issues" ON website_issues FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_issues" ON website_issues;
CREATE POLICY "insert_own_issues" ON website_issues FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_issues" ON website_issues;
CREATE POLICY "update_own_issues" ON website_issues FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_issues" ON website_issues;
CREATE POLICY "delete_own_issues" ON website_issues FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ACCESSIBLE VIEWS
CREATE TABLE IF NOT EXISTS accessible_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES website_analyses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  generated_at timestamptz DEFAULT now()
);

ALTER TABLE accessible_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_views" ON accessible_views;
CREATE POLICY "select_own_views" ON accessible_views FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_views" ON accessible_views;
CREATE POLICY "insert_own_views" ON accessible_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_views" ON accessible_views;
CREATE POLICY "update_own_views" ON accessible_views FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_views" ON accessible_views;
CREATE POLICY "delete_own_views" ON accessible_views FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  file_name text,
  file_url text,
  file_type text,
  status text NOT NULL DEFAULT 'uploading',
  summary text,
  simplified_content text,
  document_type text,
  important_dates jsonb,
  next_steps jsonb,
  eligibility text,
  required_docs text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_docs" ON documents;
CREATE POLICY "select_own_docs" ON documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_docs" ON documents;
CREATE POLICY "insert_own_docs" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_docs" ON documents;
CREATE POLICY "update_own_docs" ON documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_docs" ON documents;
CREATE POLICY "delete_own_docs" ON documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DOCUMENT CONVERSATIONS
CREATE TABLE IF NOT EXISTS document_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_conversations_doc ON document_conversations(document_id);
ALTER TABLE document_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_convos" ON document_conversations;
CREATE POLICY "select_own_convos" ON document_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_convos" ON document_conversations;
CREATE POLICY "insert_own_convos" ON document_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_convos" ON document_conversations;
CREATE POLICY "update_own_convos" ON document_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_convos" ON document_conversations;
CREATE POLICY "delete_own_convos" ON document_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- VOICE SESSIONS
CREATE TABLE IF NOT EXISTS voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript text,
  ai_response text,
  language text DEFAULT 'en',
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON voice_sessions(user_id);
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_voice" ON voice_sessions;
CREATE POLICY "select_own_voice" ON voice_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_voice" ON voice_sessions;
CREATE POLICY "insert_own_voice" ON voice_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_voice" ON voice_sessions;
CREATE POLICY "update_own_voice" ON voice_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_voice" ON voice_sessions;
CREATE POLICY "delete_own_voice" ON voice_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- LANGUAGE SESSIONS
CREATE TABLE IF NOT EXISTS language_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text text,
  result_text text,
  source_language text DEFAULT 'en',
  target_language text DEFAULT 'hi',
  mode text DEFAULT 'translate',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_language_sessions_user ON language_sessions(user_id);
ALTER TABLE language_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_lang" ON language_sessions;
CREATE POLICY "select_own_lang" ON language_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_lang" ON language_sessions;
CREATE POLICY "insert_own_lang" ON language_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_lang" ON language_sessions;
CREATE POLICY "update_own_lang" ON language_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_lang" ON language_sessions;
CREATE POLICY "delete_own_lang" ON language_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_logs" ON activity_logs;
CREATE POLICY "select_own_logs" ON activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_logs" ON activity_logs;
CREATE POLICY "insert_own_logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_logs" ON activity_logs;
CREATE POLICY "update_own_logs" ON activity_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_logs" ON activity_logs;
CREATE POLICY "delete_own_logs" ON activity_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_preferences (user_id, onboarding_completed)
  VALUES (new.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.accessibility_profiles (user_id)
  VALUES (new.id)
  ON CONFLICT DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
