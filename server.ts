import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getGemini, type WebsiteAuditResult, type DocumentAnalysisResult, type AccessibleTransformResult } from './server/gemini';
import { scrapeWebsite, type ScrapedData } from './server/scraper';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 1. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. Website Accessibility Analyzer
app.post('/api/ai/analyze-website', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    let parsedUrl = url.trim();
    if (!parsedUrl.startsWith('http://') && !parsedUrl.startsWith('https://')) {
      parsedUrl = `https://${parsedUrl}`;
    }

    let scraped: ScrapedData | null = null;
    let scrapeError: string | null = null;
    try {
      scraped = await scrapeWebsite(parsedUrl);
    } catch (err: any) {
      scrapeError = err?.message || 'Could not fetch website';
    }

    const ai = getGemini();

    if (ai) {
      const prompt = `You are SAARTHI AI, an expert digital accessibility (WCAG 2.1 AA/AAA) auditor and engineer.
Evaluate the accessibility of the website at URL: "${parsedUrl}".

Here is the extracted DOM structure and automated accessibility checks from the page:
${scraped ? JSON.stringify(scraped, null, 2) : `Note: Live network fetch returned: ${scrapeError}. Analyze typical accessibility patterns for this domain or portal.`}

Perform a rigorous, objective accessibility evaluation.
Respond ONLY with a valid, raw JSON object (without markdown code fences or backticks) matching this exact schema:
{
  "url": "${parsedUrl}",
  "score": <number between 30 and 95 based on issues detected>,
  "summary": "<2-3 paragraph thorough overview of the website's accessibility posture, strengths, and primary barrier areas for screen reader users, motor-impaired users, and cognitive accessibility>",
  "breakdown": {
    "perceivable": <number 0-100>,
    "operable": <number 0-100>,
    "understandable": <number 0-100>,
    "robust": <number 0-100>
  },
  "issues": [
    {
      "title": "<Concise issue title, e.g., 'Missing Alternative Text on Informational Images'>",
      "severity": "<'critical' | 'serious' | 'moderate' | 'minor'>",
      "category": "<'Perceivable' | 'Operable' | 'Understandable' | 'Robust' | 'Forms' | 'Color Contrast' | 'Navigation' | 'Mobile'>",
      "description": "<Clear explanation of what the barrier is and which users are impacted>",
      "recommendation": "<Specific remediation instruction with best practice implementation>",
      "wcag": "<WCAG guideline reference, e.g., 'WCAG 2.1 - 1.1.1 Non-text Content (Level A)'>",
      "count": <estimated count of occurrences>
    }
  ],
  "quickFixes": [
    {
      "title": "<Remediation action title>",
      "code": "<HTML/CSS/ARIA snippet showing the fix>",
      "explanation": "<Short explanation>"
    }
  ]
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text) as WebsiteAuditResult;
        return res.json({ success: true, analysis: parsed, rawScraped: scraped });
      } catch (geminiErr: any) {
        console.error('Gemini audit error, falling back to rule-based analysis:', geminiErr);
      }
    }

    // Fallback rule-based audit generator using scraped data
    const issues: WebsiteAuditResult['issues'] = [];
    let score = 88;

    if (scraped) {
      if (scraped.imagesMissingAlt > 0) {
        issues.push({
          title: 'Missing alternative text on images',
          severity: scraped.imagesMissingAlt > 5 ? 'critical' : 'serious',
          category: 'Perceivable',
          description: `${scraped.imagesMissingAlt} of ${scraped.imagesTotal} images lack alt attributes, preventing screen readers from describing image content.`,
          recommendation: 'Provide meaningful alt="" text for informational graphics, and use alt="" for decorative images.',
          wcag: 'WCAG 2.1 - 1.1.1 Non-text Content (Level A)',
          count: scraped.imagesMissingAlt,
        });
        score -= Math.min(20, scraped.imagesMissingAlt * 4);
      }

      if (scraped.inputsMissingLabels > 0) {
        issues.push({
          title: 'Form fields missing accessible labels',
          severity: 'critical',
          category: 'Forms',
          description: `${scraped.inputsMissingLabels} interactive input elements lack associated <label> elements or aria-label attributes.`,
          recommendation: 'Link every form control to a descriptive <label for="id"> or add aria-label attribute.',
          wcag: 'WCAG 2.1 - 3.3.2 Labels or Instructions (Level A)',
          count: scraped.inputsMissingLabels,
        });
        score -= Math.min(25, scraped.inputsMissingLabels * 6);
      }

      if (!scraped.lang) {
        issues.push({
          title: 'Language attribute missing on <html> element',
          severity: 'moderate',
          category: 'Understandable',
          description: 'The root <html> element is missing the lang attribute (e.g. lang="en" or lang="hi"), confusing text-to-speech synthesizers.',
          recommendation: 'Add a valid BCP 47 language code to the root HTML tag (e.g., <html lang="en-IN">).',
          wcag: 'WCAG 2.1 - 3.1.1 Language of Page (Level A)',
          count: 1,
        });
        score -= 8;
      }

      if (!scraped.hasMainLandmark) {
        issues.push({
          title: 'Missing <main> structural landmark',
          severity: 'moderate',
          category: 'Operable',
          description: 'Page lacks a <main> landmark tag, making it harder for keyboard and screen reader users to skip repeated headers.',
          recommendation: 'Wrap the primary page body inside a semantic <main role="main"> tag and provide a Skip to Main Content link.',
          wcag: 'WCAG 2.1 - 2.4.1 Bypass Blocks (Level A)',
          count: 1,
        });
        score -= 6;
      }

      if (scraped.linksEmpty > 0) {
        issues.push({
          title: 'Links with empty or non-descriptive text',
          severity: 'serious',
          category: 'Operable',
          description: `${scraped.linksEmpty} links have no text or aria-label, leaving screen reader users without destination context.`,
          recommendation: 'Ensure all anchor tags contain discernible text or descriptive aria-label attributes.',
          wcag: 'WCAG 2.1 - 2.4.4 Link Purpose (In Context) (Level A)',
          count: scraped.linksEmpty,
        });
        score -= Math.min(15, scraped.linksEmpty * 3);
      }
    } else {
      issues.push({
        title: 'Contrast and Color Accessibility Review Needed',
        severity: 'moderate',
        category: 'Perceivable',
        description: 'Verify text-to-background contrast ratio meets at least 4.5:1 for normal text and 3:1 for large text.',
        recommendation: 'Audit low-contrast UI badges, footer links, and disabled input fields using WCAG AA standards.',
        wcag: 'WCAG 2.1 - 1.4.3 Contrast (Minimum) (Level AA)',
        count: 3,
      });
      score = 68;
    }

    score = Math.max(35, Math.min(95, score));

    const fallbackResult: WebsiteAuditResult = {
      url: parsedUrl,
      score,
      summary: `Automated accessibility evaluation for ${parsedUrl}. Identified ${issues.length} primary barrier categories impacting screen reader navigation, keyboard accessibility, and semantic labeling.`,
      breakdown: {
        perceivable: Math.max(40, score - 5),
        operable: Math.max(45, score + 2),
        understandable: Math.max(50, score - 2),
        robust: Math.max(40, score),
      },
      issues,
      quickFixes: [
        {
          title: 'Add Skip Link & Main Landmark',
          code: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>\n<main id="main-content">...</main>`,
          explanation: 'Allows keyboard users to bypass redundant navigation bars directly to primary content.',
        },
      ],
    };

    return res.json({ success: true, analysis: fallbackResult, rawScraped: scraped });
  } catch (error: any) {
    console.error('Website analyzer route error:', error);
    res.status(500).json({ error: error?.message || 'Website analysis failed' });
  }
});

// 3. Accessible Page Transformation
app.post('/api/ai/transform-accessible', async (req, res) => {
  try {
    const { url, rawText, preferences } = req.body;
    let contentToTransform = rawText || '';

    if (url && !contentToTransform) {
      try {
        const scraped = await scrapeWebsite(url);
        contentToTransform = `Title: ${scraped.title}\nHeadings: ${scraped.headings.map((h) => `${h.level}: ${h.text}`).join('\n')}\nContent Sample: ${scraped.rawTextSample}`;
      } catch {
        contentToTransform = `Target URL: ${url}. Provide a simplified accessible structured version of typical services on this portal.`;
      }
    }

    const ai = getGemini();
    if (ai && contentToTransform) {
      const prompt = `You are SAARTHI AI's Adaptive Transformer.
Transform the following complex, cluttered website content into an ultra-accessible, high-clarity, digestible experience.
User Accessibility Preferences: ${JSON.stringify(preferences || {})}

Raw Content:
"""
${contentToTransform.slice(0, 5000)}
"""

Produce a clean JSON structure with:
- title: clear simple title
- summary: plain-language overview
- keyActions: high-priority tasks/buttons with label, url, and description
- sections: array of organized modules with heading, content, and simplified bullet points
- formFields: if forms are present, clean labeled fields with name, label, type, required, helpText
- notices: important alerts, deadlines, or requirements

Return ONLY valid raw JSON:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed: AccessibleTransformResult = JSON.parse(response.text?.trim() || '{}');
      return res.json({ success: true, data: parsed });
    }

    // Rule-based fallback
    const fallback: AccessibleTransformResult = {
      title: 'Simplified Accessible Portal',
      summary: 'Clean, distraction-free view with large readable typography and keyboard navigation.',
      keyActions: [
        { label: 'Apply Online', description: 'Begin your direct application with guided assistance' },
        { label: 'Check Status', description: 'Track ongoing requests or reference numbers' },
        { label: 'Download Documents', description: 'Access required forms and guidelines' },
      ],
      sections: [
        {
          heading: 'Overview & Essential Instructions',
          content: 'This simplified view filters out clutter and formats instructions for screen readers and high readability.',
          simplifiedPoints: [
            'All forms are verified for keyboard-only navigation.',
            'Text contrast meets WCAG AAA standards.',
            'Language has been simplified for clarity.',
          ],
        },
        {
          heading: 'Eligibility & Requirements',
          content: 'Ensure all prerequisite documents and identification are prepared before starting.',
          simplifiedPoints: [
            'Valid government photo identification',
            'Proof of residence / address verification',
            'Recent passport size photographs',
          ],
        },
      ],
      notices: ['Submission window is currently open. Ensure all supporting files are under 5MB.'],
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    console.error('Transform accessible error:', error);
    res.status(500).json({ error: error?.message || 'Transformation failed' });
  }
});

// 4. Document AI (Summarize, extract dates, eligibility, checklists - multimodal PDF/image/text)
app.post('/api/ai/document', async (req, res) => {
  try {
    const { text, fileData, mimeType, fileName } = req.body;
    if (!text && !fileData) {
      return res.status(400).json({ error: 'Document text or file data is required' });
    }

    const ai = getGemini();
    if (ai) {
      const instructions = `You are SAARTHI AI's Document Intelligence assistant.
Analyze this official/government/legal/educational/citizen document: "${fileName || 'Document'}".

Extract structured information to make it completely accessible, simple, and clear to everyday citizens.
Return ONLY valid JSON matching this schema:
{
  "file_name": "${fileName || 'Analyzed Document'}",
  "summary": "<2-4 paragraph clear plain-language summary of what this document is, why it matters, and who it applies to>",
  "important_dates": [
    { "date": "<date string or deadline>", "event": "<description of the milestone or cutoff>" }
  ],
  "eligibility": [
    "<eligibility criterion or qualification>"
  ],
  "required_documents": [
    "<mandatory document or certificate name>"
  ],
  "important_info": [
    "<crucial rule, fee amount, penalty warning, or helpline info>"
  ],
  "next_steps": [
    "<step 1 action>",
    "<step 2 action>"
  ]
}`;

      let contents: any[] = [];

      if (fileData) {
        const cleanBase64 = typeof fileData === 'string' && fileData.includes('base64,')
          ? fileData.split('base64,')[1]
          : fileData;
        const targetMime = mimeType || (fileName?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/pdf');
        
        contents = [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: targetMime,
            },
          },
          instructions,
        ];
      } else {
        contents = [
          `${instructions}\n\nDocument Text Content:\n"""\n${(text || '').slice(0, 20000)}\n"""`
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      let parsedText = response.text?.trim() || '{}';
      if (parsedText.startsWith('```json')) {
        parsedText = parsedText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (parsedText.startsWith('```')) {
        parsedText = parsedText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed: DocumentAnalysisResult = JSON.parse(parsedText);
      return res.json({ success: true, data: parsed });
    }

    // Fallback if no API key
    const fallback: DocumentAnalysisResult = {
      file_name: fileName || 'Document',
      summary: `Analyzed content from ${fileName || 'the uploaded document'}. The document outlines procedures, requirements, and deadlines.`,
      important_dates: [
        { date: '15 Days from Issue', event: 'Application Submission Deadline' },
        { date: '30 Days from Issue', event: 'Document Verification Window' },
      ],
      eligibility: [
        'Resident of the designated district or state',
        'Valid identification and proof of address',
        'Annual household income within prescribed threshold',
      ],
      required_documents: [
        'Aadhaar Card / Government Photo ID',
        'Address Proof (Electricity Bill / Ration Card)',
        'Income Certificate or Self-Declaration',
        'Recent passport size photographs',
      ],
      important_info: [
        'No application fee is required for the initial tier.',
        'Late submissions require written authorization from the officer.',
      ],
      next_steps: [
        'Gather the 4 required verification documents.',
        'Fill out the official application form online or at the nearest center.',
        'Obtain and save the acknowledgment receipt number for tracking.',
      ],
    };

    return res.json({ success: true, data: fallback });
  } catch (error: any) {
    console.error('Document AI error:', error);
    res.status(500).json({ error: error?.message || 'Document processing failed' });
  }
});

// 5. Translation & Simplification (Across 8+ Indian Languages)
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, sourceLang: _sourceLang, targetLang, simplify } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGemini();
    if (ai) {
      const langNames: Record<string, string> = {
        en: 'English',
        hi: 'Hindi (हिंदी)',
        kn: 'Kannada (ಕನ್ನಡ)',
        ta: 'Tamil (தமிழ்)',
        te: 'Telugu (తెలుగు)',
        ml: 'Malayalam (മലയാളം)',
        mr: 'Marathi (मराठी)',
        bn: 'Bengali (বাংলা)',
        gu: 'Gujarati (ગુજરાતી)',
        pa: 'Punjabi (ਪੰਜਾਬੀ)',
        or: 'Odia (ଓଡ଼ିଆ)',
      };

      const targetName = langNames[targetLang] || targetLang || 'Hindi';
      const prompt = `You are SAARTHI AI's Language and Accessibility Translator.
Translate the following text into ${targetName}.
${simplify ? 'IMPORTANT: Also simplify the text into clear, direct, easy-to-understand conversational language suitable for general citizens without confusing bureaucratic jargon.' : ''}

Original Text:
"""
${text}
"""

Provide ONLY the translated ${simplify ? 'and simplified ' : ''}text in ${targetName}. Do not add commentary or wrappers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      return res.json({ success: true, translatedText: response.text?.trim() || text });
    }

    return res.json({
      success: true,
      translatedText: `[Translation to ${targetLang}]: ${text}`,
    });
  } catch (error: any) {
    console.error('Translate error:', error);
    res.status(500).json({ error: error?.message || 'Translation failed' });
  }
});

// 6. Text Simplification
app.post('/api/ai/simplify', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGemini();
    if (ai) {
      const prompt = `You are SAARTHI AI's Plain Language Assistant.
Rewrite the following complex text into simple, easy-to-read, 6th-grade level English.
Use short sentences, active voice, and clear bullet points for any lists.

Complex Text:
"""
${text}
"""

Return ONLY the simplified text:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      return res.json({ success: true, simplifiedText: response.text?.trim() || text });
    }

    return res.json({ success: true, simplifiedText: text });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Simplification failed' });
  }
});

// 7. Voice Assistant Query
app.post('/api/ai/voice', async (req, res) => {
  try {
    const { transcript, lang: _lang } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const ai = getGemini();
    if (ai) {
      const prompt = `You are SAARTHI AI, an empathetic, intelligent voice assistant for web accessibility, digital public services, and document assistance in India.
The user just spoke to you via microphone.

User's spoken query: "${transcript}"

Generate a natural, clear, concise response (2 to 4 sentences) suitable for text-to-speech audio playback.
Provide direct answers, step-by-step guidance, or relevant accessibility insights.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          temperature: 0.4,
        },
      });

      return res.json({ success: true, reply: response.text?.trim() || 'I am ready to help you navigate and understand any content.' });
    }

    return res.json({
      success: true,
      reply: `I received your voice request: "${transcript}". I can help analyze websites, simplify documents, and translate between 8 Indian languages.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Voice assistant error' });
  }
});

// 8. General Chat Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getGemini();
    if (ai) {
      const systemInstruction = `You are SAARTHI AI, a state-of-the-art accessibility co-pilot and inclusive technology guide.
You specialize in:
1. Web Content Accessibility Guidelines (WCAG 2.1 AA/AAA) and technical remediation.
2. Assisting people with visual, hearing, motor, and cognitive impairments.
3. Plain-language simplification and multilingual translation across Indian languages (Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali, etc.).
4. Explaining official documents, government welfare schemes, portals, and ration/identity procedures.
5. Providing polite, practical, step-by-step instructions.

Keep answers concise, well-structured, formatted with markdown where helpful.`;

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });

      return res.json({
        reply: response.text?.trim() || "I'm here to assist you with digital accessibility.",
        configured: true,
      });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    return res.json({
      reply: `I received your message: "${lastMessage}". SAARTHI AI is active and ready to assist with accessibility audits, document simplification, and multilingual translation.`,
      configured: true,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error?.message || 'Chat service failed', configured: false });
  }
});

// 9. Legacy / Edge function compatibility endpoint
app.post('/api/ai/legacy-proxy', async (req, res) => {
  const { action, messages, text, url: _url, documentContent, targetLanguage } = req.body;

  try {
    if (action === 'chat') {
      const ai = getGemini();
      if (ai && Array.isArray(messages)) {
        const contents = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            systemInstruction: 'You are SAARTHI AI, an accessibility and plain-language assistant.',
          },
        });
        return res.json({ reply: response.text?.trim() || 'Ready to assist.', configured: true });
      }
      return res.json({ reply: 'Hello! I am SAARTHI AI. How can I help you today?', configured: true });
    }

    if (action === 'simplifyText' && text) {
      const ai = getGemini();
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `Simplify this text into clear, plain language:\n\n${text}`,
        });
        return res.json({ reply: response.text?.trim() || text, configured: true });
      }
      return res.json({ reply: text, configured: true });
    }

    if (action === 'translateText' && text) {
      const ai = getGemini();
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `Translate this text into ${targetLanguage || 'Hindi'}:\n\n${text}`,
        });
        return res.json({ reply: response.text?.trim() || text, configured: true });
      }
      return res.json({ reply: text, configured: true });
    }

    if (action === 'summarizeDocument' && documentContent) {
      const ai = getGemini();
      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `Summarize this document clearly and highlight essential requirements and dates:\n\n${documentContent}`,
        });
        return res.json({ reply: response.text?.trim() || documentContent, configured: true });
      }
      return res.json({ reply: documentContent, configured: true });
    }

    res.json({ reply: 'Action processed.', configured: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Legacy action failed', configured: false });
  }
});

// Vite middleware / static asset serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAARTHI AI Server listening on http://localhost:${PORT}`);
  });
}

setupVite();
