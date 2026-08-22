import { supabase } from '@/lib/supabase';
import { DEMO_ACTIVITY, DEMO_ANALYSES, DEMO_ISSUES, DEMO_METRICS } from '@/data/demoData';

export type ActivityType = 'website' | 'document' | 'voice' | 'translation' | 'chat';

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
  issues?: WebsiteIssue[];
  breakdown?: {
    perceivable: number;
    operable: number;
    understandable: number;
    robust: number;
  };
  quickFixes?: Array<{
    title: string;
    code: string;
    explanation: string;
  }>;
}

export interface StoredDocument {
  id: string;
  file_name: string;
  summary: string;
  important_dates: { date: string; event: string }[];
  eligibility: string[];
  required_documents: string[];
  important_info: string[];
  next_steps: string[];
  created_at: string;
}

const STORAGE_KEYS = {
  ACTIVITIES: 'saarthi_activities_v2',
  ANALYSES: 'saarthi_analyses_v2',
  ISSUES: 'saarthi_issues_v2',
  DOCUMENTS: 'saarthi_documents_v2',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage quota or error:', e);
  }
}

export async function addActivityLog(
  type: ActivityType,
  title: string,
  detail: string,
  score: number | null = null,
): Promise<ActivityLog> {
  const newLog: ActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    title,
    detail,
    score,
    created_at: new Date().toISOString(),
  };

  // Local storage cache
  const existing = getLocal<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, [...DEMO_ACTIVITY]);
  setLocal(STORAGE_KEYS.ACTIVITIES, [newLog, ...existing.slice(0, 49)]);

  // Attempt Supabase insert if logged in
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      await supabase.from('activity_logs').insert({
        type,
        title,
        detail,
        score,
        user_id: session.session.user.id,
      });
    }
  } catch {}

  return newLog;
}

export async function getRecentActivity(limit = 10): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id, type, title, detail, score, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as ActivityLog[];
    }
  } catch {}

  const localLogs = getLocal<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, DEMO_ACTIVITY);
  return localLogs.slice(0, limit);
}

export async function saveWebsiteAnalysis(
  url: string,
  score: number,
  summary: string,
  issuesList: Array<{
    title: string;
    severity: string;
    category: string;
    description: string;
    recommendation: string;
    wcag: string;
    count: number;
  }> = [],
  breakdown?: { perceivable: number; operable: number; understandable: number; robust: number },
  quickFixes?: Array<{ title: string; code: string; explanation: string }>,
): Promise<WebsiteAnalysis> {
  const analysisId = `an_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const mappedIssues: WebsiteIssue[] = issuesList.map((iss, i) => ({
    id: `iss_${Date.now()}_${i}`,
    analysis_id: analysisId,
    title: iss.title,
    severity: iss.severity,
    category: iss.category,
    description: iss.description,
    recommendation: iss.recommendation,
    wcag: iss.wcag,
    count: iss.count,
  }));

  const newAnalysis: WebsiteAnalysis = {
    id: analysisId,
    url,
    score,
    summary,
    created_at: new Date().toISOString(),
    issues: mappedIssues,
    breakdown,
    quickFixes,
  };

  // Local storage save
  const existingAnalyses = getLocal<WebsiteAnalysis[]>(STORAGE_KEYS.ANALYSES, [...DEMO_ANALYSES]);
  setLocal(STORAGE_KEYS.ANALYSES, [newAnalysis, ...existingAnalyses]);

  const existingIssues = getLocal<WebsiteIssue[]>(STORAGE_KEYS.ISSUES, [...DEMO_ISSUES]);
  setLocal(STORAGE_KEYS.ISSUES, [...mappedIssues, ...existingIssues]);

  // Log activity
  await addActivityLog('website', `Audited ${url}`, `Score: ${score}/100 with ${issuesList.length} issues`, score);

  // Attempt Supabase insert
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      const { data: insertedAnalysis } = await supabase
        .from('website_analyses')
        .insert({
          user_id: session.session.user.id,
          url,
          score,
          summary,
        })
        .select()
        .single();

      if (insertedAnalysis) {
        if (mappedIssues.length > 0) {
          await supabase.from('website_issues').insert(
            mappedIssues.map((iss) => ({
              analysis_id: insertedAnalysis.id,
              title: iss.title,
              severity: iss.severity,
              category: iss.category,
              description: iss.description,
              recommendation: iss.recommendation,
              wcag: iss.wcag,
              count: iss.count,
            })),
          );
        }
      }
    }
  } catch (err) {
    console.warn('Supabase save error:', err);
  }

  return newAnalysis;
}

export async function getAnalyses(limit = 100): Promise<WebsiteAnalysis[]> {
  try {
    const { data, error } = await supabase
      .from('website_analyses')
      .select('id, url, score, summary, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as WebsiteAnalysis[];
    }
  } catch {}

  const localAnalyses = getLocal<WebsiteAnalysis[]>(STORAGE_KEYS.ANALYSES, DEMO_ANALYSES);
  return localAnalyses.slice(0, limit);
}

export async function getIssues(): Promise<WebsiteIssue[]> {
  try {
    const { data, error } = await supabase
      .from('website_issues')
      .select('id, analysis_id, title, severity, category, description, recommendation, wcag, count');

    if (!error && data && data.length > 0) {
      return data as WebsiteIssue[];
    }
  } catch {}

  return getLocal<WebsiteIssue[]>(STORAGE_KEYS.ISSUES, DEMO_ISSUES);
}

export async function getAnalysisById(id: string): Promise<WebsiteAnalysis | null> {
  const analyses = await getAnalyses();
  const found = analyses.find((a) => a.id === id);
  if (found) {
    if (!found.issues) {
      const allIssues = await getIssues();
      found.issues = allIssues.filter((i) => i.analysis_id === id);
    }
    return found;
  }
  return null;
}

export async function getLatestAnalysis(): Promise<WebsiteAnalysis | null> {
  const analyses = await getAnalyses();
  if (analyses.length > 0) {
    const latest = analyses[0];
    if (!latest.issues) {
      const allIssues = await getIssues();
      latest.issues = allIssues.filter((i) => i.analysis_id === latest.id);
    }
    return latest;
  }
  return null;
}

export async function saveDocument(doc: {
  fileName: string;
  summary: string;
  importantDates: { date: string; event: string }[];
  eligibility: string[];
  requiredDocuments: string[];
  importantInfo: string[];
  nextSteps: string[];
}): Promise<StoredDocument> {
  const newDoc: StoredDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    file_name: doc.fileName,
    summary: doc.summary,
    important_dates: doc.importantDates,
    eligibility: doc.eligibility,
    required_documents: doc.requiredDocuments,
    important_info: doc.importantInfo,
    next_steps: doc.nextSteps,
    created_at: new Date().toISOString(),
  };

  const existingDocs = getLocal<StoredDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  setLocal(STORAGE_KEYS.DOCUMENTS, [newDoc, ...existingDocs]);

  await addActivityLog('document', doc.fileName, 'Simplified & analyzed document');

  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      await supabase.from('documents').insert({
        user_id: session.session.user.id,
        file_name: doc.fileName,
        summary: doc.summary,
        important_dates: doc.importantDates,
        eligibility: doc.eligibility,
        required_documents: doc.requiredDocuments,
        important_info: doc.importantInfo,
        next_steps: doc.nextSteps,
      });
    }
  } catch (err) {
    console.warn('Supabase save document error:', err);
  }

  return newDoc;
}

export async function getDocuments(): Promise<StoredDocument[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as StoredDocument[];
    }
  } catch {}

  return getLocal<StoredDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
}

export async function getDashboardMetrics() {
  const [activity, analyses, documents] = await Promise.all([
    getRecentActivity(10),
    getAnalyses(100),
    getDocuments(),
  ]);

  const translationCount = activity.filter((item) => item.type === 'translation').length;
  const voiceCount = activity.filter((item) => item.type === 'voice').length;

  return {
    activity,
    analyses: analyses.length || DEMO_METRICS.totalAnalyses,
    documents: documents.length || DEMO_METRICS.documentsSimplified,
    translations: translationCount || DEMO_METRICS.translations,
    voiceQueries: voiceCount || 12,
  };
}
