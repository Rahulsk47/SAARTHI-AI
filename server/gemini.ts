import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-flash-latest',
];

export interface GeminiCallParams {
  contents: any;
  config?: any;
  model?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error.statusCode;
  const msg = typeof error === 'string' ? error : (error.message || JSON.stringify(error) || '').toLowerCase();
  return (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === 429 ||
    status === 500 ||
    status === 'UNAVAILABLE' ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 'BAD_GATEWAY' ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('resource exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('fetch failed') ||
    msg.includes('bad gateway') ||
    msg.includes('<!doctype') ||
    msg.includes('overloaded') ||
    msg.includes('temporary')
  );
}

/**
 * Executes a Gemini generateContent request with automatic multi-model failover
 * prioritizing gemini-3.1-flash-lite for higher throughput, lower quota consumption,
 * and rapid response during high-demand periods.
 */
export async function callGemini(params: GeminiCallParams): Promise<{ text: string }> {
  const ai = getGemini();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const requestedModel = params.model || 'gemini-3.1-flash-lite';
  const modelsToTry = [
    requestedModel,
    ...CANDIDATE_MODELS.filter((m) => m !== requestedModel),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const text = response.text || '';
      if (text) {
        return { text };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(
        `[Gemini API] Failed on model "${model}" (${errMsg.slice(0, 120)}...), failing over to alternate model...`,
      );

      if (isRetryableError(err)) {
        await sleep(150 + Math.random() * 150);
        continue;
      }

      continue;
    }
  }

  throw lastError || new Error('All Gemini candidate models were temporarily unavailable');
}

export interface WebsiteAuditResult {
  url: string;
  score: number;
  summary: string;
  breakdown: {
    perceivable: number;
    operable: number;
    understandable: number;
    robust: number;
  };
  issues: Array<{
    title: string;
    severity: 'critical' | 'serious' | 'moderate' | 'minor';
    category: string;
    description: string;
    recommendation: string;
    wcag: string;
    count: number;
  }>;
  quickFixes?: Array<{
    title: string;
    code: string;
    explanation: string;
  }>;
}

export interface DocumentAnalysisResult {
  file_name: string;
  summary: string;
  important_dates: Array<{ date: string; event: string }>;
  eligibility: string[];
  required_documents: string[];
  important_info: string[];
  next_steps: string[];
}

export interface AccessibleTransformResult {
  title: string;
  summary: string;
  keyActions: Array<{ label: string; url?: string; description?: string }>;
  sections: Array<{
    heading: string;
    content: string;
    simplifiedPoints: string[];
  }>;
  formFields?: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    helpText?: string;
  }>;
  notices?: string[];
}

