/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Groq AI Client
 *
 * Lightweight wrapper around the Groq REST API for enhanced AI decisions.
 * Used for:
 *   • Generating better blueprint suggestions from notebook context
 *   • Summarizing user ideas into structured prompts
 *   • Providing intelligent workflow recommendations
 *
 * Falls back gracefully when no API key is configured.
 * ════════════════════════════════════════════════════════════════════════
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export const hasGroq =
  !!GROQ_API_KEY &&
  GROQ_API_KEY !== "your_groq_api_key_here";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqResponse {
  id: string;
  choices: { message: { role: string; content: string }; finish_reason: string }[];
}

/**
 * Send a chat completion request to Groq.
 * Returns the assistant's message content, or null on failure.
 */
export async function groqChat(
  messages: GroqMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string | null> {
  if (!hasGroq) return null;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
      }),
    });

    if (!res.ok) {
      console.warn("[Forge/Groq] API error:", res.status, await res.text());
      return null;
    }

    const data: GroqResponse = await res.json();
    return data.choices[0]?.message?.content ?? null;
  } catch (err) {
    console.warn("[Forge/Groq] Network error:", err);
    return null;
  }
}

/**
 * Use Groq to refine a raw user idea into a structured product prompt.
 */
export async function refineIdeaWithGroq(
  rawIdea: string,
  notebookContext?: string,
): Promise<string | null> {
  const systemPrompt = `You are Forge's AI assistant. The user has written notes about a product idea.
Your job is to synthesize their notes into a concise, actionable product description 
that can be fed to a UI builder AI.

Output ONLY the refined prompt — no explanations, no markdown, just the prompt.
Keep it under 200 words. Include:
- What type of app it is
- Key features / sections
- Target audience
- Visual style preferences (if mentioned)`;

  const userContent = notebookContext
    ? `Here are the user's notes:\n\n${notebookContext}\n\nAnd their latest idea:\n${rawIdea}`
    : rawIdea;

  return groqChat([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);
}

/**
 * Use Groq to suggest workflow next-steps based on the current state.
 */
export async function suggestNextSteps(
  currentBlueprint: string,
  userNotes?: string,
): Promise<string[] | null> {
  const systemPrompt = `You are Forge's workflow advisor. Given the current state of a product blueprint
and the user's notes, suggest 3-5 concrete next steps they should take.

Return ONLY a JSON array of strings. Example: ["Add authentication flow", "Design mobile layout", "Add payment integration"]`;

  const result = await groqChat(
    [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Blueprint: ${currentBlueprint}\n\nUser Notes: ${userNotes ?? "none"}`,
      },
    ],
    { temperature: 0.5 },
  );

  if (!result) return null;

  try {
    const cleaned = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Use Groq to generate a full UIBlueprint JSON for any user prompt.
 * This is the core AI generation path when Tambo isn't available.
 */
export async function generateBlueprintWithGroq(
  prompt: string,
  existingBlueprint?: string,
): Promise<Record<string, unknown> | null> {
  const systemPrompt = `You are Forge, an AI Product Builder. The user describes a product idea and you respond with a JSON object representing a UIBlueprint.

AVAILABLE COMPONENTS (use these as componentName in sections.components):
  AppShell, NavigationBar, HeroSection, FeatureGrid, PricingTable,
  FormBuilder, DataTable, CardList, ChartView, SettingsPanel, EmptyState,
  StatsRow, UserProfile, Sidebar, Footer

COMPONENT PROP GUIDES:
- AppShell: { appName: string, tagline: string, accentColor: string, showSidebar: boolean, sidebarItems: string[] }
- NavigationBar: { brand: string, links: {label,href}[], cta: {label,href}? }
- HeroSection: { headline: string, subheadline: string, ctaLabel: string, ctaHref: string, imageUrl?: string }
- FeatureGrid: { columns: 2|3|4, features: {icon,title,description}[] }
- PricingTable: { plans: {name,price,period,features:string[],cta,highlighted?}[] }
- FormBuilder: { title: string, fields: {name,label,type,placeholder?,required?,options?:string[]}[], submitLabel: string }
- DataTable: { title: string, columns: {key,label,sortable?}[], rows: Record<string,any>[] }
- CardList: { cards: {title,description,imageUrl?,badge?,tags?:string[]}[] }
- ChartView: { chartType: "bar"|"line"|"pie"|"area", title: string, data: {labels:string[],datasets:{label,data:number[],color?}[]} }
- SettingsPanel: { sections: {title,settings:{key,label,type:"toggle"|"select"|"text"|"range",value,options?:string[]}[]}[] }
- StatsRow: { stats: {label,value,change?,trend?:"up"|"down"|"neutral"}[] }
- UserProfile: { name: string, email: string, avatar?: string, role?: string, stats?: {label,value}[] }
- Sidebar: { brand?: string, sections: {title?,items:{label,icon?,href?,active?,badge?}[]}[] }
- Footer: { brand?: string, columns: {title,links:{label,href}[]}[], copyright?: string }

OUTPUT FORMAT (strict JSON, no markdown, no explanation outside the JSON):
{
  "appType": "dashboard" | "landing-page" | "tracker" | "e-commerce" | "form-app" | "social" | "portfolio" | etc.,
  "layout": "single-page" | "sidebar-detail" | "multi-section" | "dashboard",
  "sections": [
    {
      "id": "unique-section-id",
      "heading": "Optional Section Title",
      "components": [
        { "componentName": "ComponentName", "props": { ...realistic mock data... } }
      ]
    }
  ],
  "explanation": {
    "reasoning": "Why these components were chosen",
    "componentRationale": { "section-id": "Why this component fits" },
    "suggestedImprovements": ["Improvement 1", "Improvement 2", "Improvement 3"]
  }
}

RULES:
1. Output ONLY valid JSON — no markdown code fences, no extra text.
2. Use realistic mock data (real-looking names, numbers, labels).
3. Choose components that best fit the product idea.
4. Include 3-6 sections with appropriate components.
5. Always include the explanation field.
6. If refining an existing blueprint, preserve prior sections and merge changes.`;

  const userContent = existingBlueprint
    ? `Current blueprint:\n${existingBlueprint}\n\nUser's refinement request: ${prompt}`
    : prompt;

  const result = await groqChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    { temperature: 0.7, maxTokens: 4096 },
  );

  if (!result) return null;

  try {
    // Strip any accidental markdown fences
    const cleaned = result
      .replace(/^```json?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("[Forge/Groq] Failed to parse blueprint JSON:", err, result);
    return null;
  }
}
