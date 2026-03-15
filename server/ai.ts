/**
 * SkinGuard AI — Google AI Studio (Gemini) Image Analysis Router
 * Minden AI hívás a backenden fut, az API kulcs soha nem kerül a frontendre.
 */
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

Scoring guide (0 = no concern, 100 = high concern):
- A (Asymmetry): One half unlike the other half in shape
- B (Border): Irregular, ragged, notched, or blurred edges
- C (Color): Variation in color — multiple shades of brown, black, red, white, or blue
- D (Diameter): Estimated size relative to a 6mm pencil eraser

overallRisk determination:
- "low": all scores below 30
- "medium": any score 30-60 or average 25-50
- "high": any score above 60 or average above 50

IMPORTANT: Choose the most appropriate code from the lists above. Do not write free text descriptions.`;

function getGeminiClient() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;

  if (!apiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "GOOGLE_AI_STUDIO_KEY environment variable is not set.",
    });
  }

  return new GoogleGenerativeAI(apiKey);
}

async function callGeminiWithRetry(
  model: any, 
  prompt: string, 
  base64Data: string, 
  mimeType: string,
  maxRetries = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ]);

      const rawText = result.response?.text();

      if (!rawText) {
        throw new Error("Empty response received from Gemini.");
      }

      // Clean up any accidental markdown code fences
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      try {
        return JSON.parse(cleaned);
      } catch (parseError) {
        lastError = new Error(`Invalid JSON (attempt ${attempt}/${maxRetries})`);
        console.warn(`Gemini JSON parse failed on attempt ${attempt}, retrying...`);
        // If this was the last attempt, throw
        if (attempt === maxRetries) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gemini returned an invalid JSON response after multiple attempts. Please try again later.",
          });
        }
        // Otherwise continue to next attempt
        continue;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Gemini request failed on attempt ${attempt}:`, lastError.message);
      
      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gemini request failed after ${maxRetries} attempts: ${lastError.message}`,
        });
      }
      // Otherwise continue to next attempt
    }
  }
  
  throw lastError || new Error("Unknown error in Gemini call");
}

export const aiRouter = router({
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
      const genAI = getGeminiClient();

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 1024,
          temperature: 0.1,
        } as Parameters<typeof genAI.getGenerativeModel>[0]["generationConfig"],
      });

      // Strip the data URL prefix if present (e.g. "data:image/jpeg;base64,")
      const base64Data = input.imageBase64.replace(
        /^data:image\/[a-z+]+;base64,/i,
        ""
      );

      // Call Gemini with automatic retry
      const parsedAnalysis = await callGeminiWithRetry(
        model, 
        ABCDE_PROMPT, 
        base64Data, 
        input.mimeType,
        3 // max 3 attempts
      );

      // Validate overallRisk value
      if (!["low", "medium", "high"].includes(parsedAnalysis.overallRisk)) {
        parsedAnalysis.overallRisk = "medium";
      }

      return parsedAnalysis;
    }),
});