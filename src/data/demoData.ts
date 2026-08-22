// =====================================================
// SAARTHI AI - DEMO DATA & REPOSITORY DEFAULTS
// =====================================================

export type AIState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'analyzing'
  | 'processing'
  | 'transforming'
  | 'success'
  | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface WebsiteIssue {
  id: string;
  analysis_id?: string;
  title: string;
  severity: 'Critical' | 'Warning' | 'Info' | string;
  category: string;
  description: string;
  recommendation: string;
  wcag?: string;
  count?: number;
}

export interface WebsiteAnalysis {
  id: string;
  url: string;
  score: number;
  status?: string;
  summary?: string;
  createdAt?: string;
  created_at?: string;
  issues: WebsiteIssue[];
  breakdown?: {
    perceivable: number;
    operable: number;
    understandable: number;
    robust: number;
  };
}

export const demoUser = {
  id: 'demo-user-001',
  name: 'Citizen User',
  email: 'user@saarthi.ai',
  preferredLanguage: 'English',
};

export const defaultAccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  textSpacing: false,
  simpleLanguage: false,
  largeControls: false,
  reduceMotion: false,
  preferredLanguage: 'English',
};

export const DEMO_ISSUES: WebsiteIssue[] = [
  {
    id: 'issue-1',
    analysis_id: 'analysis-demo-001',
    title: 'Images missing alternative text (alt="")',
    severity: 'Critical',
    category: 'Visual & Screen Readers',
    description: '42 images lack descriptive alt text, preventing screen reader users from understanding image contents.',
    recommendation: 'Add meaningful alt attributes to all content images or alt="" for purely decorative elements.',
    wcag: 'WCAG 1.1.1 Non-text Content (Level A)',
    count: 42,
  },
  {
    id: 'issue-2',
    analysis_id: 'analysis-demo-001',
    title: 'Low text color contrast ratio',
    severity: 'Serious',
    category: 'Visual & Color',
    description: 'Subheadings and navigation text have a contrast ratio of 2.8:1, failing the 4.5:1 minimum standard.',
    recommendation: 'Darken text color or adjust background palette to achieve at least 4.5:1 for normal text.',
    wcag: 'WCAG 1.4.3 Contrast (Minimum) (Level AA)',
    count: 14,
  },
  {
    id: 'issue-3',
    analysis_id: 'analysis-demo-001',
    title: 'Missing keyboard focus indicators',
    severity: 'Serious',
    category: 'Keyboard & Navigation',
    description: 'Interactive buttons and form fields remove outline:none without custom visible focus rings.',
    recommendation: 'Provide high-contrast visible :focus and :focus-visible outlines on all interactive elements.',
    wcag: 'WCAG 2.4.7 Focus Visible (Level AA)',
    count: 8,
  },
  {
    id: 'issue-4',
    analysis_id: 'analysis-demo-001',
    title: 'Form fields missing accessible <label> tags',
    severity: 'Critical',
    category: 'Forms & Inputs',
    description: 'Search inputs and application dropdowns lack explicit <label for="..."> or aria-label attributes.',
    recommendation: 'Pair every input element with a dedicated label or descriptive aria-label.',
    wcag: 'WCAG 3.3.2 Labels or Instructions (Level A)',
    count: 9,
  },
];

export const DEMO_ANALYSES: WebsiteAnalysis[] = [
  {
    id: 'analysis-demo-001',
    url: 'https://www.india.gov.in',
    score: 78,
    status: 'completed',
    summary: 'The National Portal of India exhibits good semantic foundation but contains contrast and alt-text gaps on dynamic banner widgets.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    issues: DEMO_ISSUES,
    breakdown: {
      perceivable: 72,
      operable: 84,
      understandable: 80,
      robust: 76,
    },
  },
  {
    id: 'analysis-demo-002',
    url: 'https://uidai.gov.in',
    score: 86,
    status: 'completed',
    summary: 'Strong keyboard accessibility and bilingual support. Minor heading hierarchy issues detected on inner service pages.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    issues: DEMO_ISSUES.slice(1),
    breakdown: {
      perceivable: 88,
      operable: 90,
      understandable: 82,
      robust: 84,
    },
  },
];

export const demoWebsiteAnalysis = DEMO_ANALYSES[0];

export const DEMO_ACTIVITY = [
  {
    id: 'act-1',
    type: 'website',
    title: 'Audited https://www.india.gov.in',
    detail: 'WCAG 2.1 AA audit · Score 78/100 · 4 barrier categories detected',
    score: 78,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'act-2',
    type: 'document',
    title: 'Analyzed National Merit Scholarship.pdf',
    detail: 'Extracted eligibility, application deadlines, and required documents',
    score: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'act-3',
    type: 'translation',
    title: 'Translated Welfare Guide to Hindi & Kannada',
    detail: 'Simplified legal terminology and converted into plain regional language',
    score: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'act-4',
    type: 'voice',
    title: 'Voice Assistant Session',
    detail: 'Inquired about UDID disability certificate requirements',
    score: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const demoHistory = DEMO_ACTIVITY;
export const DEMO_HISTORY = DEMO_ACTIVITY;

export const DEMO_METRICS = {
  analyses: 12,
  documents: 8,
  translations: 19,
  averageScore: 78,
};

export const demoReports = {
  websitesAnalyzed: 12,
  averageScore: 78,
  criticalIssues: 8,
  warnings: 24,
  recommendations: 31,
};

export const DEMO_DOCUMENT = {
  id: 'doc-demo-001',
  fileName: 'National Merit Scholarship Guidelines 2026.pdf',
  summary:
    'The National Merit Scholarship provides full tuition assistance and a monthly stipend of ₹2,500 to meritorious students from economically weaker sections enrolled in recognized universities across India.',
  importantDates: [
    { event: 'Online Application Portal Opens', date: 'September 1, 2026' },
    { event: 'Application Submission Deadline', date: 'October 31, 2026' },
    { event: 'Institutional Verification Cutoff', date: 'November 15, 2026' },
    { event: 'DBT Direct Benefit Transfer Disbursement', date: 'December 10, 2026' },
  ],
  eligibility: [
    'Indian citizen enrolled in a full-time undergraduate or postgraduate degree program',
    'Minimum 75% marks or equivalent CGPA in Class XII board examination',
    'Total annual family income must not exceed ₹3,50,000 per annum',
  ],
  requiredDocuments: [
    'Class 10th and 12th passing mark sheets and certificates',
    'Valid Aadhaar Card linked to active bank account',
    'Income Certificate issued by authorized Tehsildar or Revenue Officer',
    'Bonafide student certificate issued by Head of Institution',
    'Proof of residence (Electricity bill, Domicile certificate, or Ration Card)',
  ],
  importantInfo: [
    'Incomplete applications without verifiable income certificates will be rejected automatically',
    'Disbursal will be processed strictly via Aadhaar Enabled Payment System (AEPS)',
    'Scholarship is renewable annually subject to maintaining at least 60% aggregate marks',
  ],
  nextSteps: [
    'Verify eligibility and register with student Aadhaar number on the National Scholarship Portal',
    'Upload self-attested copies of income and academic mark sheets',
    'Submit application before October 31, 2026 and retain acknowledgment receipt for tracking',
  ],
};

export const demoDocument = {
  name: DEMO_DOCUMENT.fileName,
  summary: DEMO_DOCUMENT.summary,
  importantDates: DEMO_DOCUMENT.importantDates.map((d) => `${d.event}: ${d.date}`),
  eligibility: DEMO_DOCUMENT.eligibility,
  requiredDocuments: DEMO_DOCUMENT.requiredDocuments,
  importantInformation: DEMO_DOCUMENT.importantInfo,
  nextSteps: DEMO_DOCUMENT.nextSteps,
};

export const DEMO_REPORT = {
  id: 'demo-report-001',
  url: 'https://www.india.gov.in',
  title: 'Example Website Accessibility Report',
  score: 78,
  summary: DEMO_ANALYSES[0].summary,
  issues: DEMO_ISSUES,
  createdAt: new Date().toISOString(),
};

export const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    analyze: 'Analyze',
    dashboard: 'Dashboard',
    settings: 'Settings',
  },
  hi: {
    welcome: 'स्वागत है',
    analyze: 'विश्लेषण करें',
    dashboard: 'डैशबोर्ड',
    settings: 'सेटिंग्स',
  },
  kn: {
    welcome: 'ಸ್ವಾಗತ',
    analyze: 'ವಿಶ್ಲೇಷಿಸಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  },
};
