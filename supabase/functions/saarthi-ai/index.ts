import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  action: "chat" | "simplifyText" | "translateText" | "analyzeAccessibilityIssues" | "summarizeDocument";
  messages?: ChatMessage[];
  text?: string;
  targetLanguage?: string;
  context?: string;
  url?: string;
  documentContent?: string;
}

const AI_API_KEY = Deno.env.get("AI_API_KEY");

const SAARTHI_SYSTEM_PROMPT = `You are SAARTHI AI, an accessibility-focused assistant for the SAARTHI AI platform — "The Internet Should Adapt to You."

Your role is to help users with:
- Understanding complex websites and their accessibility issues
- Providing WCAG-based accessibility guidance and recommendations
- Simplifying complex text into plain, easy-to-understand language
- Explaining documents and extracting key information
- Translation assistance across Indian languages (English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, Malayalam)
- Navigation help within the SAARTHI AI application
- General accessibility best practices

Keep responses concise, friendly, and actionable. When discussing accessibility, reference WCAG criteria where relevant. If a user asks about a specific page in the app, guide them to it.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!AI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "AI_API_KEY is not configured. Please add an AI_API_KEY secret to your Supabase project to enable AI features.",
          configured: false,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { action } = body;

    let systemPrompt = SAARTHI_SYSTEM_PROMPT;
    let userContent = "";

    switch (action) {
      case "chat":
        // messages-based conversation
        break;
      case "simplifyText":
        systemPrompt = `${SAARTHI_SYSTEM_PROMPT}\n\nYou are now in SIMPLIFY mode. Simplify the following text into plain, easy-to-understand language. Keep the meaning but make it shorter and clearer. Use simple words.`;
        userContent = `Simplify this text:\n\n${body.text || ""}`;
        break;
      case "translateText":
        systemPrompt = `${SAARTHI_SYSTEM_PROMPT}\n\nYou are now in TRANSLATE mode. Translate the following text into ${body.targetLanguage || "Hindi"}. Keep the meaning accurate and natural.`;
        userContent = `Translate this text to ${body.targetLanguage || "Hindi"}:\n\n${body.text || ""}`;
        break;
      case "analyzeAccessibilityIssues":
        systemPrompt = `${SAARTHI_SYSTEM_PROMPT}\n\nYou are now in ACCESSIBILITY ANALYSIS mode. Analyze the described website or content for accessibility issues. Provide a list of issues with severity, WCAG criteria, and recommendations.`;
        userContent = `Analyze this website for accessibility issues:\n\nURL: ${body.url || "N/A"}\n\nContext: ${body.context || "N/A"}`;
        break;
      case "summarizeDocument":
        systemPrompt = `${SAARTHI_SYSTEM_PROMPT}\n\nYou are now in DOCUMENT ANALYSIS mode. Analyze the document and provide: a summary, important dates, eligibility criteria, required documents, important information, and next steps. Format as JSON.`;
        userContent = `Analyze this document:\n\n${body.documentContent || body.text || ""}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: chat, simplifyText, translateText, analyzeAccessibilityIssues, or summarizeDocument." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Build messages for OpenAI-compatible API
    let apiMessages: ChatMessage[];
    if (action === "chat" && body.messages) {
      apiMessages = [{ role: "system", content: systemPrompt }, ...body.messages];
    } else {
      apiMessages = [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }];
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("AI API error:", openaiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: `AI service returned an error (${openaiResponse.status}). Please try again.` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await openaiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ reply, configured: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
