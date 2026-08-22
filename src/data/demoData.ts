// =====================================================
// SAARTHI AI - DEMO DATA & MOCK SERVICES
// Initial GitHub Demo Version
// =====================================================

export type AIState =
  | "idle"
  | "listening"
  | "thinking"
  | "analyzing"
  | "processing"
  | "transforming"
  | "success"
  | "error";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface WebsiteIssue {
  id: string;
  title: string;
  severity: "Critical" | "Warning" | "Info";
  category: string;
  description: string;
  recommendation: string;
}

export interface WebsiteAnalysis {
  id: string;
  url: string;
  score: number;
  status: string;
  createdAt: string;
  issues: WebsiteIssue[];
}

// =====================================================
// DEMO USER
// =====================================================

export const demoUser = {
  id: "demo-user-001",
  name: "Demo User",
  email: "demo@saarthi.ai",
  preferredLanguage: "English",
};

// =====================================================
// DEMO ACCESSIBILITY SETTINGS
// =====================================================

export const defaultAccessibilitySettings = {
  fontSize: "medium",
  highContrast: false,
  textSpacing: false,
  simpleLanguage: false,
  largeControls: false,
  reduceMotion: false,
  preferredLanguage: "English",
};

// =====================================================
// DEMO WEBSITE ANALYSIS
// =====================================================

export const demoWebsiteAnalysis: WebsiteAnalysis = {
  id: "analysis-demo-001",
  url: "https://example.com",
  score: 78,
  status: "completed",
  createdAt: new Date().toISOString(),

  issues: [
    {
      id: "issue-1",
      title: "Images missing alternative text",
      severity: "Critical",
      category: "Visual",
      description:
        "Some images do not contain meaningful alternative text for screen readers.",
      recommendation:
        "Add descriptive alt text to all important images.",
    },
    {
      id: "issue-2",
      title: "Low color contrast",
      severity: "Warning",
      category: "Visual",
      description:
        "Some text does not have enough contrast against its background.",
      recommendation:
        "Increase contrast to meet WCAG accessibility guidelines.",
    },
    {
      id: "issue-3",
      title: "Keyboard navigation issue",
      severity: "Warning",
      category: "Navigation",
      description:
        "Some interactive elements cannot be reached using only a keyboard.",
      recommendation:
        "Ensure all interactive elements are keyboard accessible.",
    },
    {
      id: "issue-4",
      title: "Complex language detected",
      severity: "Info",
      category: "Content",
      description:
        "Some content may be difficult for users with cognitive or language barriers.",
      recommendation:
        "Provide a simplified language version.",
    },
  ],
};

// =====================================================
// DEMO HISTORY
// =====================================================

export const demoHistory = [
  {
    id: "history-1",
    type: "Website Analysis",
    title: "example.com",
    date: "Today",
    status: "Completed",
  },
  {
    id: "history-2",
    type: "Document AI",
    title: "Government Scheme.pdf",
    date: "Yesterday",
    status: "Completed",
  },
  {
    id: "history-3",
    type: "Language",
    title: "English → Hindi",
    date: "2 days ago",
    status: "Completed",
  },
  {
    id: "history-4",
    type: "Voice Session",
    title: "SAARTHI Voice Assistant",
    date: "3 days ago",
    status: "Completed",
  },
];

// =====================================================
// DEMO REPORT DATA
// =====================================================

export const demoReports = {
  websitesAnalyzed: 12,
  averageScore: 76,
  criticalIssues: 8,
  warnings: 24,
  recommendations: 31,
};

// =====================================================
// DEMO DOCUMENT
// =====================================================

export const demoDocument = {
  name: "Government Assistance Scheme.pdf",

  summary:
    "This document explains a government assistance program designed to provide financial support to eligible citizens.",

  importantDates: [
    "Application opens: January 10",
    "Application deadline: March 31",
  ],

  eligibility: [
    "Must be an Indian citizen",
    "Must meet income requirements",
    "Must provide valid identification",
  ],

  requiredDocuments: [
    "Government ID",
    "Address proof",
    "Income certificate",
    "Bank account details",
  ],

  importantInformation: [
    "Applications are submitted online.",
    "Verification may take several working days.",
    "Incomplete applications may be rejected.",
  ],

  nextSteps: [
    "Check your eligibility.",
    "Prepare required documents.",
    "Complete the online application.",
    "Submit before the deadline.",
  ],
};

// =====================================================
// DEMO AI CHATBOT
// =====================================================

export const getDemoAIResponse = async (
  message: string
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const text = message.toLowerCase();

  if (text.includes("website") || text.includes("analyze")) {
    return `I can help analyze a website for accessibility issues. You can use the Website Analyzer to check visual accessibility, keyboard navigation, forms, content clarity, and language accessibility.`;
  }

  if (text.includes("document") || text.includes("pdf")) {
    return `I can help you understand your document. SAARTHI can summarize important information, identify dates, explain eligibility, list required documents, and answer questions about the content.`;
  }

  if (text.includes("simplify")) {
    return `I can simplify complex content into clear and easy-to-understand language. This can help users with cognitive, language, or digital literacy barriers.`;
  }

  if (
    text.includes("hindi") ||
    text.includes("translate") ||
    text.includes("language")
  ) {
    return `SAARTHI supports multilingual assistance. You can translate or simplify content into languages such as Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, and Malayalam.`;
  }

  if (text.includes("accessibility")) {
    return `SAARTHI helps personalize your digital experience with features such as larger text, high contrast, reduced motion, simple language, keyboard navigation, and other accessibility controls.`;
  }

  if (text.includes("hello") || text.includes("hi")) {
    return `Hello! 👋 I am SAARTHI, your AI accessibility assistant. I can help you understand websites, documents, accessibility features, languages, and more. How can I help you today?`;
  }

  return `I understand your request. SAARTHI AI is designed to help make digital experiences simpler, more accessible, and personalized. Try asking me about website accessibility, documents, translation, or accessibility settings.`;
};

// =====================================================
// DEMO WEBSITE ANALYZER
// =====================================================

export const analyzeDemoWebsite = async (
  url: string
): Promise<WebsiteAnalysis> => {
  await new Promise((resolve) => setTimeout(resolve, 2500));

  return {
    ...demoWebsiteAnalysis,
    id: crypto.randomUUID(),
    url,
    createdAt: new Date().toISOString(),
  };
};

// =====================================================
// DEMO DOCUMENT PROCESSING
// =====================================================

export const processDemoDocument = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return demoDocument;
};

// =====================================================
// DEMO TRANSLATION
// =====================================================

export const translateDemoText = async (
  text: string,
  language: string
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `[Demo ${language} Translation]\n\n${text}`;
};

// =====================================================
// DEMO TEXT SIMPLIFICATION
// =====================================================

export const simplifyDemoText = async (
  text: string
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return `Simplified version:\n\n${text}
  
This content has been processed by SAARTHI AI Demo Mode to demonstrate how complex information can be presented in a clearer and easier-to-understand format.`;
};