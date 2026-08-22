type Action =
  | "chat"
  | "simplifyText"
  | "translateText"
  | "analyzeAccessibilityIssues"
  | "analyzeWebsite"
  | "summarizeDocument";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  action?: Action;
  messages?: ChatMessage[];
  text?: string;
  targetLanguage?: string;
  url?: string;
  context?: string;
  documentContent?: string;
}

interface WebsiteIssue {
  title: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  category: string;
  description: string;
  recommendation: string;
  wcag: string;
  count: number;
}
// @ts-ignore Supabase Edge Functions provide Deno at runtime
const OPENAI_API_KEY = Deno.env.get("AI_API_KEY");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const OPENAI_MODEL = "gpt-4o-mini";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const systemPrompt = `
You are SAARTHI AI, a helpful accessibility assistant.

Help users understand:
- websites
- documents
- accessibility issues
- translations
- digital services

Be clear, concise, practical, and friendly.

Use plain language whenever possible.
`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isSafeUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value);

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return false;
    }

    const host = parsedUrl.hostname.toLowerCase();

    // Block local/internal hosts.
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host === "0.0.0.0" ||
      host === "::1"
    ) {
      return false;
    }

    // Block IPv4 private/local addresses.
    if (
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function inspectHtml(html: string): WebsiteIssue[] {
  const issues: WebsiteIssue[] = [];

  // 1. Images without alt text
  const imagesWithoutAlt = Array.from(
    html.matchAll(/<img\b(?![^>]*\balt\s*=)[^>]*>/gi)
  ).length;

  if (imagesWithoutAlt > 0) {
    issues.push({
      title: "Images missing alternative text",
      severity: "serious",
      category: "Images",
      description:
        "Some images do not provide alternative text for screen-reader users.",
      recommendation:
        'Add meaningful alt text, or alt="" for decorative images.',
      wcag: "1.1.1",
      count: imagesWithoutAlt,
    });
  }

  // 2. Form inputs without accessible names
  const inputsWithoutName = Array.from(
    html.matchAll(/<input\b[^>]*>/gi)
  ).filter((match) => {
    const tag = match[0];

    // Ignore hidden and button-like inputs.
    if (
      /\btype\s*=\s*["']?(hidden|submit|button|reset|image)["']?/i.test(
        tag
      )
    ) {
      return false;
    }

    const hasAriaLabel = /\baria-label\s*=/i.test(tag);

    const hasAriaLabelledBy =
      /\baria-labelledby\s*=/i.test(tag);

    return !hasAriaLabel && !hasAriaLabelledBy;
  }).length;

  if (inputsWithoutName > 0) {
    issues.push({
      title: "Form controls may be unlabeled",
      severity: "serious",
      category: "Forms",
      description:
        "Inputs without an accessible name were detected.",
      recommendation:
        "Use a visible label linked by for/id, aria-label, or aria-labelledby.",
      wcag: "1.3.1",
      count: inputsWithoutName,
    });
  }

  // 3. Empty links
  const emptyLinks = Array.from(
    html.matchAll(
      /<a\b[^>]*>\s*(?:<img\b[^>]*>)?\s*<\/a>/gi
    )
  ).length;

  if (emptyLinks > 0) {
    issues.push({
      title: "Empty links",
      severity: "serious",
      category: "Navigation",
      description:
        "Links without readable text or an accessible image description were found.",
      recommendation:
        "Give every link an accessible name describing its destination.",
      wcag: "2.4.4",
      count: emptyLinks,
    });
  }

  // 4. Heading hierarchy
  const headings = Array.from(
    html.matchAll(/<h([1-6])\b[^>]*>/gi)
  ).map((match) => Number(match[1]));

  const skippedHeadings = headings.filter(
    (level, index) =>
      index > 0 &&
      level > headings[index - 1] + 1
  ).length;

  if (skippedHeadings > 0) {
    issues.push({
      title: "Heading levels are skipped",
      severity: "moderate",
      category: "Structure",
      description:
        "The heading hierarchy jumps over one or more levels.",
      recommendation:
        "Use headings in a logical order without skipping levels.",
      wcag: "1.3.1",
      count: skippedHeadings,
    });
  }

  // 5. Missing page language
  const hasLangAttribute =
    /<html\b[^>]*\blang\s*=/i.test(html);

  if (!hasLangAttribute) {
    issues.push({
      title: "Page language is not declared",
      severity: "moderate",
      category: "Language",
      description:
        "The html element does not declare the page language.",
      recommendation:
        'Set the lang attribute, for example <html lang="en">.',
      wcag: "3.1.1",
      count: 1,
    });
  }

  return issues;
}

async function analyzeWebsite(url: string) {
  if (!isSafeUrl(url)) {
    throw new Error(
      "Enter a valid public HTTP or HTTPS URL."
    );
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "SAARTHI-AI-Accessibility-Checker/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(
      `The website returned HTTP ${response.status}.`
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    !contentType
      .toLowerCase()
      .includes("text/html")
  ) {
    throw new Error(
      "The URL did not return an HTML page."
    );
  }

  const html = (await response.text()).slice(
    0,
    1500000
  );

  const issues = inspectHtml(html);

  const severityPenalty: Record<
    WebsiteIssue["severity"],
    number
  > = {
    critical: 12,
    serious: 8,
    moderate: 5,
    minor: 2,
  };

  const penalty = issues.reduce(
    (total, issue) =>
      total +
      issue.count *
        severityPenalty[issue.severity],
    0
  );

  const score = Math.max(
    0,
    Math.min(100, 100 - penalty)
  );

  return {
    url,
    score,
    summary: issues.length
      ? `${issues.length} accessibility issue types were detected by the automated HTML check. Manual testing is still recommended.`
      : "No issues were detected by the automated HTML check. Manual testing is still recommended.",
    issues,
  };
}

async function askOpenAI(
  messages: ChatMessage[]
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "AI service is not configured. Add AI_API_KEY in Supabase Edge Function Secrets."
    );
  }

  const response = await fetch(
    OPENAI_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: 1000,
        temperature: 0.5,
      }),
    }
  );

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error(
      "The AI provider returned an invalid response."
    );
  }

  if (!response.ok) {
    const errorBody = body as {
      error?: {
        message?: string;
      };
    };

    throw new Error(
      errorBody?.error?.message ||
        "The AI provider returned an error."
    );
  }

  const responseBody = body as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const reply =
    responseBody.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error(
      "The AI provider returned an empty response."
    );
  }

  return reply;
}

function getMessages(
  body: RequestBody
): ChatMessage[] {
  const action = body.action;

  const text = cleanText(body.text);

  const documentContent = cleanText(
    body.documentContent
  );

  // CHAT
  if (action === "chat") {
    const messages = Array.isArray(body.messages)
      ? body.messages.filter(
          (
            message
          ): message is ChatMessage =>
            typeof message?.content === "string" &&
            ["user", "assistant", "system"].includes(
              message.role
            )
        )
      : [];

    if (!messages.length) {
      throw new Error(
        "Chat requires at least one message."
      );
    }

    return [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages,
    ];
  }

  // SIMPLIFY TEXT
  if (action === "simplifyText") {
    if (!text) {
      throw new Error("Text is required.");
    }

    return [
      {
        role: "system",
        content: `${systemPrompt}

Simplify the supplied text using short, clear sentences.

Preserve its original meaning.

Do not add unnecessary information.`,
      },
      {
        role: "user",
        content: text,
      },
    ];
  }

  // TRANSLATE TEXT
  if (action === "translateText") {
    if (!text) {
      throw new Error("Text is required.");
    }

    const language =
      cleanText(body.targetLanguage) ||
      "Hindi";

    return [
      {
        role: "system",
        content: `${systemPrompt}

Translate the supplied content to ${language}.

Return only the translation.

Do not add explanations.`,
      },
      {
        role: "user",
        content: text,
      },
    ];
  }

  // SUMMARIZE DOCUMENT
  if (action === "summarizeDocument") {
    const content =
      documentContent || text;

    if (!content) {
      throw new Error(
        "Document text is required."
      );
    }

    return [
      {
        role: "system",
        content: `${systemPrompt}

Summarize the supplied document.

Identify:
- Important dates
- Eligibility
- Required documents
- Important information
- Recommended next steps

Use clear headings and simple language.`,
      },
      {
        role: "user",
        content,
      },
    ];
  }

  // ANALYZE ACCESSIBILITY ISSUES
  if (action === "analyzeAccessibilityIssues") {
    const url = cleanText(body.url);

    const context = cleanText(body.context);

    return [
      {
        role: "system",
        content: `${systemPrompt}

Explain accessibility issues using WCAG guidance.

Do not claim that you visited a website unless HTML content was actually supplied.

Give practical recommendations in simple language.`,
      },
      {
        role: "user",
        content: `URL: ${url}

Context:
${context}`,
      },
    ];
  }

  throw new Error("Invalid action.");
}
// @ts-ignore Supabase Edge Functions provide Deno.serve at runtime
Deno.serve(async (request: Request): Promise<Response> => {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only POST requests are allowed
  if (request.method !== "POST") {
    return json(
      {
        error: "Method not allowed.",
      },
      405
    );
  }

  try {
    const body =
      (await request.json()) as RequestBody;

    if (!body.action) {
      return json(
        {
          error: "Missing action.",
        },
        400
      );
    }

    // Website analysis does not require OpenAI
    if (body.action === "analyzeWebsite") {
      const url = cleanText(body.url);

      if (!url) {
        return json(
          {
            error:
              "analyzeWebsite requires a URL.",
          },
          400
        );
      }

      const analysis =
        await analyzeWebsite(url);

      return json({
        analysis,
        configured: true,
      });
    }

    // AI-powered actions
    const messages = getMessages(body);

    const reply =
      await askOpenAI(messages);

    return json({
      reply,
      configured: true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return json(
      {
        error: message,
        configured: Boolean(
          OPENAI_API_KEY
        ),
      },
      500
    );
  }
});