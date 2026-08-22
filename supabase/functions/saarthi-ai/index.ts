interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

type Action =
  | "chat"
  | "simplifyText"
  | "translateText"
  | "analyzeAccessibilityIssues"
  | "summarizeDocument";

interface RequestBody {
  action?: Action;
  messages?: ChatMessage[];
  text?: string;
  targetLanguage?: string;
  context?: string;
  url?: string;
  documentContent?: string;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
  "Content-Type": "application/json",
};

const AI_API_KEY =
  Deno.env.get("AI_API_KEY");

const OPENAI_API_URL =
  "https://api.openai.com/v1/chat/completions";

const OPENAI_MODEL =
  "gpt-4o-mini";

const SAARTHI_SYSTEM_PROMPT = `
You are SAARTHI AI, an accessibility-focused assistant for the SAARTHI AI platform.

Platform tagline:
"The Internet Should Adapt to You."

Your role is to help users with:

- Understanding complex websites
- Understanding accessibility issues
- Providing WCAG-based accessibility guidance
- Simplifying complex text into plain language
- Explaining documents
- Extracting important information from documents
- Translation between Indian languages
- Navigation help inside the SAARTHI AI application
- General digital accessibility guidance

Supported Indian languages include:

English
Hindi
Kannada
Tamil
Telugu
Marathi
Bengali
Malayalam

Keep responses:

- Concise
- Friendly
- Clear
- Practical
- Actionable

When discussing accessibility, reference WCAG criteria when appropriate.

Do not invent facts about a website or document when the required information has not been provided.
`;

/* -------------------------------------------------------
   JSON RESPONSE HELPER
------------------------------------------------------- */

function jsonResponse(
  data: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: corsHeaders,
    },
  );
}

/* -------------------------------------------------------
   STRING HELPER
------------------------------------------------------- */

function cleanText(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/* -------------------------------------------------------
   VALIDATE CHAT MESSAGES
------------------------------------------------------- */

function isValidChatMessage(
  message: unknown,
): message is ChatMessage {
  if (
    typeof message !== "object" ||
    message === null
  ) {
    return false;
  }

  const item =
    message as Record<string, unknown>;

  return (
    (item.role === "user" ||
      item.role === "assistant" ||
      item.role === "system") &&
    typeof item.content === "string"
  );
}

/* -------------------------------------------------------
   BUILD REQUEST
------------------------------------------------------- */

function buildRequest(
  body: RequestBody,
): {
  systemPrompt: string;
  messages: ChatMessage[];
} {
  const action = body.action;

  if (action === "chat") {
    const messages =
      Array.isArray(body.messages)
        ? body.messages.filter(
            isValidChatMessage,
          )
        : [];

    return {
      systemPrompt:
        SAARTHI_SYSTEM_PROMPT,

      messages: [
        {
          role: "system",
          content:
            SAARTHI_SYSTEM_PROMPT,
        },
        ...messages,
      ],
    };
  }

  switch (action) {
    case "simplifyText": {
      const text =
        cleanText(body.text);

      return {
        systemPrompt: `
${SAARTHI_SYSTEM_PROMPT}

You are now in SIMPLIFY mode.

Simplify the supplied text into plain,
easy-to-understand language.

Rules:
- Keep the original meaning.
- Use simple words.
- Use short sentences.
- Remove unnecessary complexity.
- Do not add information that is not present.
        `.trim(),

        messages: [
          {
            role: "system",
            content: `
${SAARTHI_SYSTEM_PROMPT}

Simplify mode is enabled.
            `.trim(),
          },
          {
            role: "user",
            content:
              `Simplify this text:\n\n${text}`,
          },
        ],
      };
    }

    case "translateText": {
      const text =
        cleanText(body.text);

      const language =
        cleanText(
          body.targetLanguage,
        ) || "Hindi";

      return {
        systemPrompt: `
${SAARTHI_SYSTEM_PROMPT}

You are now in TRANSLATE mode.

Translate the supplied text into
${language}.

Rules:
- Preserve the original meaning.
- Use natural language.
- Do not add explanations unless requested.
        `.trim(),

        messages: [
          {
            role: "system",
            content: `
${SAARTHI_SYSTEM_PROMPT}

Translation mode is enabled.
Target language: ${language}
            `.trim(),
          },
          {
            role: "user",
            content:
              `Translate this text to ${language}:\n\n${text}`,
          },
        ],
      };
    }

    case "analyzeAccessibilityIssues": {
      const url =
        cleanText(body.url) ||
        "N/A";

      const context =
        cleanText(body.context) ||
        "N/A";

      return {
        systemPrompt: `
${SAARTHI_SYSTEM_PROMPT}

You are now in ACCESSIBILITY ANALYSIS mode.

Analyze only the information supplied to you.

For every accessibility issue, provide:

1. Issue title
2. Severity
3. WCAG criterion
4. Explanation
5. Recommended fix

Do not claim that you actually visited or scanned a URL
unless website content has been supplied to you.
        `.trim(),

        messages: [
          {
            role: "system",
            content:
              SAARTHI_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content:
              `Analyze this website for accessibility issues.

URL:
${url}

Available context:
${context}`,
          },
        ],
      };
    }

    case "summarizeDocument": {
      const documentContent =
        cleanText(
          body.documentContent ||
            body.text,
        );

      return {
        systemPrompt: `
${SAARTHI_SYSTEM_PROMPT}

You are now in DOCUMENT ANALYSIS mode.

Analyze the supplied document.

Return a concise JSON object with:

{
  "summary": "...",
  "importantDates": [],
  "eligibilityCriteria": [],
  "requiredDocuments": [],
  "importantInformation": [],
  "nextSteps": []
}

Return valid JSON only.
        `.trim(),

        messages: [
          {
            role: "system",
            content: `
${SAARTHI_SYSTEM_PROMPT}

Document analysis mode is enabled.
Return valid JSON only.
            `.trim(),
          },
          {
            role: "user",
            content:
              `Analyze this document:\n\n${documentContent}`,
          },
        ],
      };
    }

    default:
      throw new Error(
        "Invalid or missing action.",
      );
  }
}

/* -------------------------------------------------------
   MAIN EDGE FUNCTION
------------------------------------------------------- */

Deno.serve(
  async (req: Request) => {
    /* -----------------------------------------------
       CORS
    ------------------------------------------------ */

    if (
      req.method === "OPTIONS"
    ) {
      return new Response(
        null,
        {
          status: 204,
          headers: corsHeaders,
        },
      );
    }

    /* -----------------------------------------------
       Only POST is supported
    ------------------------------------------------ */

    if (
      req.method !== "POST"
    ) {
      return jsonResponse(
        {
          error:
            "Method not allowed. Use POST.",
        },
        405,
      );
    }

    try {
      /* ---------------------------------------------
         Check API key
      --------------------------------------------- */

      if (!AI_API_KEY) {
        console.error(
          "AI_API_KEY is not configured.",
        );

        return jsonResponse(
          {
            error:
              "AI service is not configured. Add AI_API_KEY to your Supabase Edge Function secrets.",
            configured: false,
          },
          503,
        );
      }

      /* ---------------------------------------------
         Parse JSON
      --------------------------------------------- */

      let body: RequestBody;

      try {
        body =
          (await req.json()) as RequestBody;
      } catch {
        return jsonResponse(
          {
            error:
              "Invalid JSON request body.",
          },
          400,
        );
      }

      /* ---------------------------------------------
         Validate action
      --------------------------------------------- */

      if (!body.action) {
        return jsonResponse(
          {
            error:
              "Missing action.",
            allowedActions: [
              "chat",
              "simplifyText",
              "translateText",
              "analyzeAccessibilityIssues",
              "summarizeDocument",
            ],
          },
          400,
        );
      }

      /* ---------------------------------------------
         Validate chat
      --------------------------------------------- */

      if (
        body.action === "chat" &&
        (!Array.isArray(
          body.messages,
        ) ||
          body.messages.length === 0)
      ) {
        return jsonResponse(
          {
            error:
              "Chat action requires a non-empty messages array.",
          },
          400,
        );
      }

      /* ---------------------------------------------
         Validate text-based actions
      --------------------------------------------- */

      if (
        body.action ===
          "simplifyText" &&
        !cleanText(body.text)
      ) {
        return jsonResponse(
          {
            error:
              "simplifyText requires a text value.",
          },
          400,
        );
      }

      if (
        body.action ===
          "translateText" &&
        !cleanText(body.text)
      ) {
        return jsonResponse(
          {
            error:
              "translateText requires a text value.",
          },
          400,
        );
      }

      if (
        body.action ===
          "summarizeDocument" &&
        !cleanText(
          body.documentContent ||
            body.text,
        )
      ) {
        return jsonResponse(
          {
            error:
              "summarizeDocument requires documentContent or text.",
          },
          400,
        );
      }

      /* ---------------------------------------------
         Build AI messages
      --------------------------------------------- */

      const {
        messages,
      } = buildRequest(body);

      /* ---------------------------------------------
         Check message size
      --------------------------------------------- */

      const totalCharacters =
        messages.reduce(
          (
            total,
            message,
          ) =>
            total +
            message.content.length,
          0,
        );

      if (
        totalCharacters >
        100000
      ) {
        return jsonResponse(
          {
            error:
              "Request is too large. Please shorten the supplied text or document.",
          },
          413,
        );
      }

      /* ---------------------------------------------
         OpenAI request
      --------------------------------------------- */

      const openaiResponse =
        await fetch(
          OPENAI_API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${AI_API_KEY}`,
            },

            body: JSON.stringify({
              model:
                OPENAI_MODEL,

              messages,

              max_tokens: 1000,

              temperature: 0.7,
            }),
          },
        );

      /* ---------------------------------------------
         Handle OpenAI error
      --------------------------------------------- */

      if (
        !openaiResponse.ok
      ) {
        const errorText =
          await openaiResponse.text();

        console.error(
          "OpenAI API error:",
          openaiResponse.status,
          errorText,
        );

        let errorMessage =
          "The AI service returned an error.";

        try {
          const errorData =
            JSON.parse(
              errorText,
            ) as {
              error?: {
                message?: string;
              };
            };

          if (
            errorData.error?.message
          ) {
            errorMessage =
              errorData.error.message;
          }
        } catch {
          // Ignore invalid JSON from provider.
        }

        return jsonResponse(
          {
            error:
              errorMessage,
            configured: true,
          },
          502,
        );
      }

      /* ---------------------------------------------
         Parse OpenAI response
      --------------------------------------------- */

      const aiData =
        (await openaiResponse.json()) as OpenAIResponse;

      const reply =
        aiData.choices?.[0]
          ?.message?.content
          ?.trim();

      if (!reply) {
        console.error(
          "OpenAI returned no message:",
          aiData,
        );

        return jsonResponse(
          {
            error:
              "The AI service returned an empty response.",
            configured: true,
          },
          502,
        );
      }

      /* ---------------------------------------------
         Success
      --------------------------------------------- */

      return jsonResponse(
        {
          reply,
          configured: true,
          action: body.action,
        },
        200,
      );
    } catch (error) {
      console.error(
        "SAARTHI Edge Function error:",
        error,
      );

      return jsonResponse(
        {
          error:
            "An unexpected server error occurred. Please try again.",
          configured:
            Boolean(AI_API_KEY),
        },
        500,
      );
    }
  },
);