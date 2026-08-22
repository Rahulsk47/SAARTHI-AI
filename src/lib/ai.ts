export interface AccessibilityIssueResult {
  title: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  category: string;
  description: string;
  recommendation: string;
  wcag: string;
  count: number;
}

export interface WebsiteAnalysisResult {
  url: string;
  score: number;
  summary: string;
  breakdown?: {
    perceivable: number;
    operable: number;
    understandable: number;
    robust: number;
  };
  issues: AccessibilityIssueResult[];
  quickFixes?: Array<{
    title: string;
    code: string;
    explanation: string;
  }>;
}

export type AccessibilityAnalysisResult = WebsiteAnalysisResult;

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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Chat request failed' }));
    throw new Error(err.error || `Chat error (${response.status})`);
  }

  const data = await response.json();
  return data.reply || '';
}

export async function simplifyText(text: string): Promise<string> {
  const response = await fetch('/api/ai/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Simplification failed' }));
    throw new Error(err.error || `Simplification error (${response.status})`);
  }

  const data = await response.json();
  return data.simplifiedText || text;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  simplify = false,
): Promise<string> {
  const response = await fetch('/api/ai/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang: targetLanguage, simplify }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Translation failed' }));
    throw new Error(err.error || `Translation error (${response.status})`);
  }

  const data = await response.json();
  return data.translatedText || text;
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysisResult> {
  const response = await fetch('/api/ai/analyze-website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || `Analysis error (${response.status})`);
  }

  const data = await response.json();
  return data.analysis as WebsiteAnalysisResult;
}

export async function transformAccessible(
  url?: string,
  rawText?: string,
  preferences?: any,
): Promise<AccessibleTransformResult> {
  const response = await fetch('/api/ai/transform-accessible', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, rawText, preferences }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Transformation failed' }));
    throw new Error(err.error || `Transformation error (${response.status})`);
  }

  const data = await response.json();
  return data.data as AccessibleTransformResult;
}

export interface ProcessDocumentOptions {
  text?: string;
  fileData?: string;
  mimeType?: string;
  fileName?: string;
}

export async function processDocument(
  input: string | ProcessDocumentOptions,
  fileName?: string,
): Promise<DocumentAnalysisResult> {
  const payload =
    typeof input === 'string'
      ? { text: input, fileName }
      : { ...input, fileName: input.fileName || fileName };

  const response = await fetch('/api/ai/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Document processing failed' }));
    throw new Error(err.error || `Document error (${response.status})`);
  }

  const data = await response.json();
  return data.data as DocumentAnalysisResult;
}

export async function queryVoice(transcript: string, lang = 'en-IN'): Promise<string> {
  const response = await fetch('/api/ai/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, lang }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Voice request failed' }));
    throw new Error(err.error || `Voice error (${response.status})`);
  }

  const data = await response.json();
  return data.reply || '';
}

export async function summarizeDocument(documentContent: string): Promise<string> {
  const res = await processDocument(documentContent, 'Document');
  return res.summary;
}

export async function analyzeAccessibilityIssues(
  url: string,
  _context?: string,
): Promise<string> {
  const res = await analyzeWebsite(url);
  return res.summary;
}
