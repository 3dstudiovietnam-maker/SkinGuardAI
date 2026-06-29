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
const LAB_MODEL = "gemini-2.5-flash";
// LAB_LITE = brief/fast mode so a multi-panel lab analysis reliably finishes inside
// the Vercel HOBBY 60s function limit. Flip to FALSE after upgrading to Vercel Pro
// (then also raise vercel.json functions.maxDuration 60 → 300) for full clinical depth.
const LAB_LITE = true;

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

// Generic JSON Gemini call (used by the pro Lab Reader). Key in header (not URL),
// joins multi-part responses, supports a per-call model + responseSchema payloads.
async function callGemini(
  payload: object,
  maxRetries = 3,
  model: string = GEMINI_MODEL
): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent`;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error(`[GeminiError] model=${model} status=${response.status} body=${errText.slice(0, 700)}`);
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> }; finishReason?: string }>;
      };
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      // Gemini can split a large JSON response across MULTIPLE parts — JOIN them all.
      const rawText =
        parts.filter((p) => !p.thought && typeof p.text === "string").map((p) => p.text).join("") ||
        parts[0]?.text;
      if (!rawText) {
        const fr = data.candidates?.[0]?.finishReason;
        console.error(`[GeminiEmpty] model=${model} finishReason=${fr}`);
        throw new Error(`Empty response from Gemini (finishReason=${fr}).`);
      }
      try {
        return extractJson(rawText);
      } catch {
        const fr = data.candidates?.[0]?.finishReason;
        // PRIVACY: never log rawText head/tail — it can contain patient/lab content (GDPR).
        console.error(`[GeminiBadJSON] model=${model} len=${rawText.length} finishReason=${fr} partsCount=${parts.length}`);
        lastError = new Error(`Invalid JSON from Gemini on attempt ${attempt}.`);
        if (attempt === maxRetries) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Gemini returned invalid JSON after retries." });
        }
        await new Promise(r => setTimeout(r, attempt * 1000));
        continue;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxRetries) {
        console.error(`[GeminiFail] model=${model} attempts=${attempt} msg=${lastError.message.slice(0, 700)}`);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Gemini failed: ${lastError.message}` });
      }
      await new Promise(r => setTimeout(r, attempt * 1200));
    }
  }
  throw lastError ?? new Error("Unknown error");
}

const LAB_SCHEMA = {
  type: "OBJECT",
  properties: {
    analyzable: { type: "BOOLEAN" },
    reportInfo: { type: "OBJECT", properties: {
      patient: { type: "STRING" }, reason: { type: "STRING" }, sampleDate: { type: "STRING" },
      doctor: { type: "STRING" }, facility: { type: "STRING" }, panels: { type: "STRING" },
    } },
    overview: { type: "STRING" },
    tests: { type: "ARRAY", items: { type: "OBJECT", properties: {
      category: { type: "STRING" }, name: { type: "STRING" }, value: { type: "STRING" },
      unit: { type: "STRING" }, referenceRange: { type: "STRING" },
      status: { type: "STRING", enum: ["low", "normal", "high", "unknown"] },
    } } },
    referenceNotes: { type: "ARRAY", items: { type: "STRING" } },
    findings: { type: "ARRAY", items: { type: "OBJECT", properties: {
      title: { type: "STRING" }, badge: { type: "STRING" },
      severity: { type: "STRING", enum: ["info", "mild", "moderate", "high"] },
      explanation: { type: "STRING" },
    } } },
    reassuring: { type: "ARRAY", items: { type: "STRING" } },
    urgency: { type: "OBJECT", properties: { level: { type: "STRING" }, text: { type: "STRING" } } },
    emergencyRedFlags: { type: "ARRAY", items: { type: "STRING" } },
    questionsForDoctor: { type: "ARRAY", items: { type: "STRING" } },
    furtherTests: { type: "ARRAY", items: { type: "STRING" } },
    homeActions: { type: "OBJECT", properties: {
      dos: { type: "ARRAY", items: { type: "STRING" } },
      donts: { type: "ARRAY", items: { type: "STRING" } },
    } },
    disclaimer: { type: "STRING" },
  },
};

function buildLabReportPrompt(lang: string, files: { mimeType: string; base64Data: string }[]): object {
  const today = new Date().toISOString().slice(0, 10);
  return {
    contents: [{
      parts: [
        { text: `You are a meticulous medical health-literacy expert writing a PROFESSIONAL, patient-friendly summary of a LABORATORY REPORT for a layperson and their family. The attached file(s) are medical lab report(s) (may be several pages or panels). Today's date is ${today} (for reference only — do NOT deliberate about ages or years). Read EVERYTHING: patient/header details, every test row on every page, units, reference ranges, and dates.

Write like a caring, careful doctor explaining results to a family: clear, reassuring, honest, and genuinely useful. CONNECT the findings into one coherent picture instead of listing them in isolation. Always account for the patient's AGE and SEX when interpreting reference ranges (e.g. ideal young-adult targets are not realistic for an elderly patient; note sex-specific ranges).

Fill the given JSON schema (it defines the exact structure — you do not need to restate it). Field guide:
- reportInfo: COPY the patient's name/sex/age/DOB, reason/diagnosis, sample date, doctor, facility and panel names EXACTLY as printed. Do not compute or deliberate.
- tests: EVERY row from every page; value, unit and referenceRange EXACTLY as printed; status = low|normal|high|unknown; "category" = the test's panel name.
- overview: 2-3 sentences on how the findings connect. findings: only the important abnormal results (short title, severity info|mild|moderate|high, a SHORT plain explanation, never a diagnosis). reassuring = normal/good news. urgency = {short level, 1-2 sentences}. emergencyRedFlags / questionsForDoctor / furtherTests = short lists. homeActions = {dos, donts}. disclaimer = one sentence.

CRITICAL RULES:
- NEVER state a diagnosis or name a disease as a conclusion. Describe what markers measure and what they MAY indicate, always deferring to the doctor. Use careful, hedged language.
- Be calm and non-alarming, but do not hide important findings. For out-of-range values, explain plainly and say they are worth discussing with a doctor.
- Read and include EVERY test row from EVERY page. Keep values, units and reference ranges EXACTLY as printed. Group each test by its panel in "category".
- Tailor interpretation to the patient's age and sex when shown; if a flagged value is expected/benign for that age, say so in referenceNotes or the finding.
- "findings" covers the abnormal or clinically meaningful results (not every normal one). "reassuring" covers the normal / good news.
- emergencyRedFlags must be genuinely urgent symptoms relevant to the abnormal findings.
- If the file is NOT a readable lab report, set "analyzable" false, leave arrays empty, and put a short note in "overview" (in ${lang}) asking for a clearer photo or the original PDF.
- Keep the overview and every explanation FOCUSED and CONCISE — a few clear sentences each. This is a fast, readable summary, not a long essay.
- Output ONLY the final JSON values. NEVER write your reasoning, calculations, working notes, or any repeated/looping text inside a field — each field holds exactly ONE concise final value. Do not deliberate; just state the result.
- ALL human-readable text MUST be in ${lang}.${LAB_LITE ? "\n- BRIEF MODE (this is CRITICAL — respond quickly and compactly): each finding explanation = 1 short sentence; overview = 2 sentences. Include only the most important items — at most 4 findings, 3 questions, 3 further tests, 3 reassuring points, 3 emergency red flags, 2 dos and 2 donts. STILL include EVERY test row in the table (these are compact)." : ""}` },
        ...files.map((f) => ({ inlineData: { mimeType: f.mimeType, data: f.base64Data } })),
      ],
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: LAB_SCHEMA,
      maxOutputTokens: LAB_LITE ? 5120 : 12288,
      temperature: 0.5,
      thinkingConfig: { thinkingBudget: LAB_LITE ? 0 : 1024 },
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };
}

export const aiRouter = router({
  // Authenticated lab analysis — logged-in users get the full reader, no IP cap.
  analyzeLabReport: protectedProcedure
    .input(z.object({
      files: z.array(z.object({
        fileBase64: z.string().min(1),
        mimeType: z.string().default("image/jpeg"),
      })).min(1).max(5),
      language: z.string().default("en"),
    }))
    .mutation(async ({ input }) => {
      const files = input.files.map((f) => {
        const m = f.fileBase64.match(/^data:([^;]+);base64,/i);
        return { mimeType: m?.[1] || f.mimeType, base64Data: f.fileBase64.replace(/^data:[^;]+;base64,/i, "") };
      });
      const payload = buildLabReportPrompt(input.language, files);
      // LITE: a single attempt (no 3× retry) so a slow call can't stack to >60s on Hobby.
      const result = await callGemini(payload, LAB_LITE ? 1 : 2, LAB_MODEL);
      return { ...result, remainingToday: 999 };
    }),

  // Public IP-rate-limited demo (works without login).
  publicAnalyzeLabReport: publicProcedure
    .input(z.object({
      files: z.array(z.object({
        fileBase64: z.string().min(1),
        mimeType: z.string().default("image/jpeg"),
      })).min(1).max(5),
      language: z.string().default("en"),
    }))
    .mutation(async ({ input, ctx }) => {
      const isPremiumUser = ctx.user !== null && ["pro", "pro_plus", "lifetime"].includes(ctx.user.plan ?? "");
      let remaining = 999;
      if (!isPremiumUser) {
        const ip = (ctx.req.headers["x-forwarded-for"]?.split(",")[0]?.trim()) || ctx.req.socket?.remoteAddress || "unknown";
        remaining = checkIpLimit(ip, 3);
      }
      const files = input.files.map((f) => {
        const m = f.fileBase64.match(/^data:([^;]+);base64,/i);
        return { mimeType: m?.[1] || f.mimeType, base64Data: f.fileBase64.replace(/^data:[^;]+;base64,/i, "") };
      });
      const payload = buildLabReportPrompt(input.language, files);
      // LITE: a single attempt (no 3× retry) so a slow call can't stack to >60s on Hobby.
      const result = await callGemini(payload, LAB_LITE ? 1 : 2, LAB_MODEL);
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
