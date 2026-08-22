import { supabase } from '@/lib/supabase';

export type ActivityType =
  | 'website'
  | 'document'
  | 'voice'
  | 'translation';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  score: number | null;
  created_at: string;
}

export interface WebsiteIssue {
  id: string;
  analysis_id: string;
  title: string;
  severity: string;
  category: string;
  description: string;
  recommendation: string;
  wcag: string;
  count: number;
}

export interface WebsiteAnalysis {
  id: string;
  url: string;
  score: number;
  summary: string;
  created_at: string;
}

export async function getRecentActivity(
  limit = 5,
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, type, title, detail, score, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as ActivityLog[];
}

export async function getAnalyses(
  limit = 100,
): Promise<WebsiteAnalysis[]> {
  const { data, error } = await supabase
    .from('website_analyses')
    .select('id, url, score, summary, created_at')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as WebsiteAnalysis[];
}

export async function getIssues(): Promise<WebsiteIssue[]> {
  const { data, error } = await supabase
    .from('website_issues')
    .select(
      'id, analysis_id, title, severity, category, description, recommendation, wcag, count',
    );

  if (error) {
    throw error;
  }

  return (data ?? []) as WebsiteIssue[];
}

export async function getDashboardMetrics() {
  const [activity, analyses, documents] = await Promise.all([
    getRecentActivity(),
    supabase.from('website_analyses').select('id, score', {
      count: 'exact',
    }),
    supabase.from('documents').select('id', {
      count: 'exact',
      head: true,
    }),
  ]);

  if (analyses.error) {
    throw analyses.error;
  }

  if (documents.error) {
    throw documents.error;
  }

  const translationCount = activity.filter(
    (item) => item.type === 'translation',
  ).length;

  return {
    activity,
    analyses: analyses.count ?? 0,
    documents: documents.count ?? 0,
    translations: translationCount,
  };
}