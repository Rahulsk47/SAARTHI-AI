import { supabase } from '@/lib/supabase';

const EDGE_FUNCTION_URL =
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/saarthi-ai`;

interface AIResponse {
  reply: string;
  configured: boolean;
  error?: string;
}

export interface AccessibilityIssueResult {
  title: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  category: string;
  description: string;
  recommendation: string;
  wcag: string;
  count: number;
}

export interface AccessibilityAnalysisResult {
  url: string;
  score: number;
  summary: string;
  issues: AccessibilityIssueResult[];
}

async function callEdgeFunction(
  body: Record<string, unknown>,
): Promise<AIResponse> {
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session?.session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Request failed' }));

    throw new Error(
      errorData.error || `Request failed (${response.status})`,
    );
  }

  const data: AIResponse = await response.json();

  if (!data.configured) {
    throw new Error(data.error || 'AI is not configured.');
  }

  return data;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chat(
  messages: ChatMessage[],
): Promise<string> {
  const result = await callEdgeFunction({
    action: 'chat',
    messages,
  });

  return result.reply;
}

export async function simplifyText(
  text: string,
): Promise<string> {
  const result = await callEdgeFunction({
    action: 'simplifyText',
    text,
  });

  return result.reply;
}

export async function translateText(
  text: string,
  targetLanguage: string,
): Promise<string> {
  const result = await callEdgeFunction({
    action: 'translateText',
    text,
    targetLanguage,
  });

  return result.reply;
}

export async function analyzeAccessibilityIssues(
  url: string,
  context?: string,
): Promise<string> {
  const result = await callEdgeFunction({
    action: 'analyzeAccessibilityIssues',
    url,
    context,
  });

  return result.reply;
}

export async function analyzeWebsite(
  url: string,
): Promise<AccessibilityAnalysisResult> {
  const { data: session } = await supabase.auth.getSession();

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${
        session.session?.access_token ??
        import.meta.env.VITE_SUPABASE_ANON_KEY
      }`,
    },
    body: JSON.stringify({
      action: 'analyzeWebsite',
      url,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.error || 'Website analysis failed.',
    );
  }

  return body.analysis as AccessibilityAnalysisResult;
}

export async function summarizeDocument(
  documentContent: string,
): Promise<string> {
  const result = await callEdgeFunction({
    action: 'summarizeDocument',
    documentContent,
  });

  return result.reply;
}