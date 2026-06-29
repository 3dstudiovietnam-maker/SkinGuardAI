/**
 * SkinGuard AI — Google AI Studio (Gemini) Image Analysis Router
 * Uses direct fetch to v1 endpoint with GOOGLE_AI_STUDIO_KEY.
 * Bypasses SDK to avoid v1beta default issue.
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

// ── IP-based rate limiter for public AI endpoint ──────────────────────────────
const ipLimitMap = new Map<string, { count: number; date: string }>();

function checkIpLimit(ip: string, maxPerDay = 3): number {
  const today = new Date().toISOString().slice(0, 10); // "2025-01-15"
  const entry = ipLimitMap.get(ip);
  if (!entry || entry.date !== today) {
    ipLimitMap.set(ip, { count: 1, date: today });
    return maxPerDay - 1; // remaining
  }
  if (entry.count >= maxPerDay) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Daily limit reached" });
  }
  entry.count++;
  return maxPerDay - entry.count; // remaining
}

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-2.5-flash";

const ABCDE_PROMPT = `You are a dermatology screening AI assistant. Analyze this skin mole/lesion image using the ABCDE dermoscopy criteria.

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with this EXACT structure:
{
  "asymmetry": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "border": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "color": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "diameter": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "overallRisk": "<low|medium|high>",
  "recommendationCode": "<code from list below>",
  "disclaimer": "This AI screening is for informational purposes only and is not a medical diagnosis. Always consult a qualified dermatologist for professional evaluation."
}

AVAILABLE DESCRIPTION CODES (choose the most appropriate one):

ASYMMETRY_CODES:
- "ASYMMETRY_NONE": The lesion appears completely symmetrical.
- "ASYMMETRY_MINOR": The lesion shows minimal asymmetry in one axis.
- "ASYMMETRY_MODERATE": The lesion exhibits some asymmetry in its overall shape.
- "ASYMMETRY_SIGNIFICANT": The lesion is significantly asymmetrical in multiple axes.

BORDER_CODES:
- "BORDER_REGULAR": The borders are smooth and well-defined.
- "BORDER_SLIGHTLY_IRREGULAR": The borders show slight irregularity.
- "BORDER_IRREGULAR": The borders appear irregular and somewhat blurred.
- "BORDER_VERY_IRREGULAR": The borders are highly irregular, ragged, or notched.

COLOR_CODES:
- "COLOR_UNIFORM": The lesion shows uniform color throughout.
- "COLOR_SLIGHT_VARIATION": The lesion shows slight color variation.
- "COLOR_MODERATE_VARIATION": The lesion shows some variation in color.
- "COLOR_SIGNIFICANT_VARIATION": The lesion shows multiple colors or significant variation.

DIAMETER_CODES:
- "DIAMETER_SMALL": The lesion appears small, less than 6mm.
- "DIAMETER_MEDIUM": The lesion appears medium, around 6mm.
- "DIAMETER_LARGE": The lesion appears larger than 6mm.
- "DIAMETER_VERY_LARGE": The lesion appears significantly larger than 6mm.

RECOMMENDATION_CODES:
- "RECOMMENDATION_LOW": "Given the low risk assessment, continue regular self-monitoring and annual dermatologist visits as recommended for your age group. No immediate action required."
- "RECOMMENDATION_MEDIUM": "Given the medium risk assessment, it is advisable to have this lesion examined by a dermatologist for a definitive diagnosis. Regular self-skin checks are also recommended."
- "RECOMMENDATION_HIGH": "Given the high risk assessment, please schedule an appointment with a dermatologist as soon as possible for professional evaluation. Do not delay seeking medical advice."
- "RECOMMENDATION_URGENT": "This lesion shows concerning features. Please consult a dermatologist immediately for professional evaluation."

Scoring guide — each score is independent (0 = no concern at all, 100 = maximum concern):
- A (Asymmetry): 0 = perfectly symmetrical, 100 = highly asymmetrical in both axes
- B (Border): 0 = smooth well-defined edges, 100 = very irregular ragged notched edges
- C (Color): 0 = completely uniform single color, 100 = multiple colors significant variation
- D (Diameter): 0 = tiny lesion clearly under 6mm, 100 = very large lesion well over 6mm

IMPORTANT SCORING RULES:
- A normal healthy mole with no concerning features should score 0-20 on ALL criteria.
- Only score 60+ if that specific feature is clearly and significantly abnormal.
- Do NOT inflate scores. A slightly irregular border is 30-45, not 70.
- The scores MUST reflect only what you actually see in the image.
- Set overallRisk based ONLY on the scores you assign, using this exact table:
  * "low"   → weighted average below 30 (weights: A=30%, B=30%, C=25%, D=15%)
  * "medium" → weighted average 30–54
  * "high"  → weighted average 55 or above

IMPORTANT: Choose the most appropriate code from the lists above. Do not write free text descriptions.`;

/**
 * Deterministic risk calculator — always overrides the AI's own overallRisk.
 * Weights: Asymmetry 30%, Border 30%, Color 25%, Diameter 15%
 * Low: weighted avg < 30 | Medium: 30–54 | High: ≥ 55
 */
function computeRisk(analysis: Record<string, unknown>): "low" | "medium" | "high" {
  const s = (key: string): number => {
    const val = (analysis[key] as Record<string, unknown>)?.score;
    return typeof val === "number" ? Math.max(0, Math.min(100, val)) : 0;
  };

  const a = s("asymmetry");
  const b = s("border");
  const c = s("color");
  const d = s("diameter");

  const weighted = a * 0.30 + b * 0.30 + c * 0.25 + d * 0.15;

  if (weighted < 30) return "low";
  if (weighted < 55) return "medium";
  return "high";
}

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "GOOGLE_AI_STUDIO_KEY environment variable is not set.",
    });
  }
  return apiKey;
}

/**
 * Extract JSON from Gemini response text.
 * Handles: markdown code fences, leading/trailing text, thought tokens.
 */
function extractJson(raw: string): Record<string, unknown> {
  // 1. Strip markdown code fences
  let text = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  // 2. Try direct parse
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch { /* fall through */ }

  // 3. Find first { ... } block in case Gemini added preamble text
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch { /* fall through */ }
  }

  throw new Error("Cannot extract valid JSON from Gemini response");
}

async function callGeminiWithRetry(
  base64Data: string,
  mimeType: string,
  maxRetries = 3
): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();
  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: ABCDE_PROMPT },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json", // Force JSON output — prevents markdown wrapping
            maxOutputTokens: 1024,
            temperature: 0.1,
            // Disable thinking tokens — gemini-2.5-flash puts them in parts[0]
            // with {thought:true} which breaks our JSON extraction.
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
      });

      if (!response.ok) {
        let errText = await response.text();
        if (response.status === 404) {
          try {
            const listResp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=20`
            );
            const listData = await listResp.json() as { models?: Array<{ name: string }> };
            const names = (listData.models ?? []).map((m: { name: string }) => m.name).join(" | ");
            errText += ` || AVAILABLE_MODELS: [${names || "NONE — key may be invalid"}]`;
          } catch { /* ignore */ }
        }
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json() as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string; thought?: boolean }>;
          };
        }>;
      };

      // gemini-2.5-flash returns thinking tokens as parts with {thought: true}.
      // We must skip those and only use the actual output part.
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const outputPart = parts.find((p) => !p.thought && typeof p.text === "string");
      const rawText = outputPart?.text ?? parts[0]?.text;

      if (!rawText) {
        throw new Error("Empty response received from Gemini.");
      }

      try {
        return extractJson(rawText);
      } catch {
        lastError = new Error(`Invalid JSON on attempt ${attempt}/${maxRetries}: ${rawText.slice(0, 120)}`);
        console.warn(`Gemini JSON parse failed on attempt ${attempt}:`, lastError.message);
        if (attempt === maxRetries) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gemini returned an invalid JSON response after multiple attempts.",
          });
        }
        continue;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Gemini request failed on attempt ${attempt}:`, lastError.message);

      if (attempt === maxRetries) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gemini request failed after ${maxRetries} attempts: ${lastError.message}`,
        });
      }
    }
  }

  throw lastError ?? new Error("Unknown error in Gemini call");
}

function buildLabReportPrompt(lang, mimeType, base64Data) {
  return {
    contents: [{
      parts: [
        { text: `You are a careful health-literacy assistant. The attached file is a medical LABORATORY REPORT (blood test or similar). Read it and explain it in PLAIN, reassuring language for a layperson.

Return ONLY valid JSON:
{
  "analyzable": <true|false>,
  "summary": "2-4 sentence plain-language overview in ${lang}",
  "tests": [ { "name": "test name", "value": "as printed", "unit": "as printed", "referenceRange": "as printed or empty", "status": "<low|normal|high|unknown>", "explanation": "1 simple sentence in ${lang}" } ],
  "flagged": ["names of tests that are out of range"],
  "questionsForDoctor": ["2-4 useful questions to ask your doctor, in ${lang}"],
  "disclaimer": "one-sentence reminder in ${lang} that this is educational, not a diagnosis"
}

RULES:
- NEVER diagnose, never name diseases as conclusions, never suggest treatment. Describe what markers measure, not what condition the person has.
- Be calm and non-alarming. For out-of-range values, say it "is outside the typical range and worth discussing with a doctor".
- Only include tests you can actually read. Keep values/units exactly as printed.
- If the file is NOT a readable lab report, set "analyzable" to false, leave "tests" empty, and put a short note in "summary" (in ${lang}) asking for a clearer photo or PDF.
- All human-readable text MUST be in ${lang}.` },
        { inlineData: { mimeType, data: base64Data } },
      ],
    }],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 8192, temperature: 0.1, thinkingConfig: { thinkingBudget: 0 } },
  };
}

export const aiRouter = router({
  publicAnalyzeLabReport: publicProcedure
    .input(z.object({ fileBase64: z.string().min(1), mimeType: z.string().default("image/jpeg"), language: z.string().default("en") }))
    .mutation(async ({ input, ctx }) => {
      const isPremiumUser = ctx.user !== null && ["pro", "pro_plus", "lifetime"].includes(ctx.user.plan ?? "");
      let remaining = 999;
      if (!isPremiumUser) {
        const ip = (ctx.req.headers["x-forwarded-for"]?.split(",")[0]?.trim()) || ctx.req.socket?.remoteAddress || "unknown";
        remaining = checkIpLimit(ip, 3);
      }
      const mimeMatch = input.fileBase64.match(/^data:([^;]+);base64,/i);
      const realMime = mimeMatch?.[1] || input.mimeType;
      const data = input.fileBase64.replace(/^data:[^;]+;base64,/i, "");
      const payload = buildLabReportPrompt(input.language, realMime, data);
      const apiKey = getApiKey();
      const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Lab analysis failed" });
      const dj = await response.json();
      const parts = dj?.candidates?.[0]?.content?.parts ?? [];
      const rawText = parts.find((p) => typeof p.text === "string")?.text ?? "{}";
      const result = extractJson(rawText);
      return { ...result, remainingToday: remaining };
    }),

  analyzeImage: protectedProcedure
    .input(
      z.object({
        imageBase64: z
          .string()
          .min(100, "Image data is too short — please provide a valid image"),
        mimeType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input }) => {
      // Strip the data URL prefix if present (e.g. "data:image/jpeg;base64,")
      const base64Data = input.imageBase64.replace(
        /^data:image\/[a-z+]+;base64,/i,
        ""
      );

      const parsedAnalysis = await callGeminiWithRetry(
        base64Data,
        input.mimeType,
        3
      );

      // Always override AI's overallRisk with deterministic backend calculation
      parsedAnalysis.overallRisk = computeRisk(parsedAnalysis);

      return parsedAnalysis;
    }),

  // ── Public endpoint: no auth required, IP-rate-limited (3/day) ─────────────
  // Premium/Lifetime logged-in users bypass the IP limit entirely.
  publicAnalyzeImage: publicProcedure
    .input(
      z.object({
        imageBase64: z.string().min(100, "Image data is too short"),
        mimeType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const isPremiumUser =
        ctx.user !== null &&
        ["pro", "pro_plus", "lifetime"].includes(ctx.user.plan ?? "");

      let remaining: number;
      if (isPremiumUser) {
        // No limit for paid subscribers — return a high sentinel value
        remaining = 999;
      } else {
        const ip =
          (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          ctx.req.socket?.remoteAddress ||
          "unknown";
        remaining = checkIpLimit(ip, 3);
      }

      const base64Data = input.imageBase64.replace(
        /^data:image\/[a-z+]+;base64,/i,
        ""
      );

      const parsedAnalysis = await callGeminiWithRetry(base64Data, input.mimeType, 3);

      // Always override AI's overallRisk with deterministic backend calculation
      parsedAnalysis.overallRisk = computeRisk(parsedAnalysis);

      return { ...parsedAnalysis, remainingToday: remaining };
    }),
});
