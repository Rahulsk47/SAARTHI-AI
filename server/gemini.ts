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
