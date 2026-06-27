import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, RefreshCw, Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

interface IsicImage {
  id: string;
  filename: string;
  diagnosis: string;
  risk: string;
  benign_malignant: string;
}

type GuessState = "idle" | "guessed" | "analyzed";

export default function RandomImageTest() {
  const { t } = useLanguage();
  const [metadata, setMetadata] = useState<IsicImage[]>([]);
  const [currentImage, setCurrentImage] = useState<IsicImage | null>(null);
  const [userGuess, setUserGuess] = useState<"good" | "dangerous" | null>(null);
  const [state, setState] = useState<GuessState>("idle");
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [remainingToday, setRemainingToday] = useState<number>(3);
  const [limitReached, setLimitReached] = useState(false);
  const [imageError, setImageError] = useState(false);

  const analyzeMutation = trpc.ai.publicAnalyzeImage.useMutation();

  // Load metadata once
  useEffect(() => {
    fetch("/isic-metadata.json")
      .then((r) => r.json())
      .then((data: IsicImage[]) => {
        setMetadata(data);
        pickRandom(data);
      })
      .catch(() => {
        // fallback: use placeholder
      });
  }, []);

  const pickRandom = useCallback((data: IsicImage[]) => {
    if (!data.length) return;
    const idx = Math.floor(Math.random() * data.length);
    setCurrentImage(data[idx]);
    setUserGuess(null);
    setAiResult(null);
    setState("idle");
    setImageError(false);
  }, []);

  const handleGuess = async (guess: "good" | "dangerous") => {
    if (!currentImage || state !== "idle") return;
    setUserGuess(guess);
    setState("guessed");

    // Fetch the image as base64 and analyze
    try {
      const imgUrl = `/test-images/${currentImage.filename}`;
      const resp = await fetch(imgUrl);
      const blob = await resp.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const result = await analyzeMutation.mutateAsync({
        imageBase64: base64,
        mimeType: "image/jpeg",
      });

      setAiResult(result);
      setRemainingToday((result.remainingToday as number) ?? 0);
      setState("analyzed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("too_many_requests") || msg.toLowerCase().includes("daily limit")) {
        setLimitReached(true);
      }
      setState("analyzed");
    }
  };

  const handleNext = () => {
    pickRandom(metadata);
  };

  const isCorrect =
    userGuess !== null &&
    currentImage !== null &&
    ((userGuess === "dangerous" && currentImage.risk === "high") ||
      (userGuess === "good" && currentImage.risk === "low"));

  const riskColor = (risk: string) => {
    if (risk === "low") return "text-green-600 bg-green-50 border-green-200";
    if (risk === "medium") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  if (!currentImage) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Image card */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-lg mb-4">
        {!imageError ? (
          <img
            src={`/test-images/${currentImage.filename}`}
            alt="Skin lesion"
            className="w-full h-64 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-slate-800 text-slate-400 text-sm">
            Image unavailable
          </div>
        )}

        {/* Overlay badge after guess */}
        <AnimatePresence>
          {state === "analyzed" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
            >
              {isCorrect ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                  <span className="text-white font-bold text-lg drop-shadow">{t("test.correctGuess")}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="w-16 h-16 text-red-400" />
                  <span className="text-white font-bold text-lg drop-shadow">{t("test.incorrectGuess")}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Guess buttons */}
      {state === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-center text-sm font-medium text-slate-600 mb-3">
            {t("test.yourGuess")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGuess("good")}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 border-green-300 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <ThumbsUp className="w-7 h-7 text-green-600" />
              <span className="text-sm font-semibold text-green-700">{t("test.good")}</span>
            </button>
            <button
              onClick={() => handleGuess("dangerous")}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 border-red-300 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <ThumbsDown className="w-7 h-7 text-red-600" />
              <span className="text-sm font-semibold text-red-700">{t("test.dangerous")}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {state === "guessed" && (
        <div className="flex items-center justify-center gap-2 py-4 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{t("test.analyzing")}</span>
        </div>
      )}

      {/* Result card */}
      {state === "analyzed" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Ground truth */}
          <div className={`p-3 rounded-xl border text-sm font-semibold text-center ${riskColor(currentImage.risk)}`}>
            {t("test.aiSays")}: {currentImage.diagnosis.toUpperCase()} — {currentImage.risk.toUpperCase()}
          </div>

          {/* AI result summary if available */}
          {aiResult && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              {["asymmetry", "border", "color", "diameter"].map((key) => {
                const item = aiResult[key] as { score?: number } | undefined;
                return item ? (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize font-medium">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(item.score ?? 0) > 60 ? "bg-red-400" : (item.score ?? 0) > 30 ? "bg-amber-400" : "bg-green-400"}`}
                          style={{ width: `${item.score ?? 0}%` }}
                        />
                      </div>
                      <span>{item.score ?? 0}</span>
                    </div>
                  </div>
                ) : null;
              })}
              {/* Inline medical disclaimer */}
              <div className="flex items-start gap-1.5 pt-2 mt-1 border-t border-slate-200 text-[11px] leading-snug text-amber-700">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                <span className="italic">{t("aiDescriptions.AI_DISCLAIMER")}</span>
              </div>
            </div>
          )}

          {/* Remaining limit badge */}
          {!limitReached && (
            <p className="text-xs text-center text-slate-400">
              {t("test.dailyLimit").replace("{{count}}", String(remainingToday))}
            </p>
          )}

          {/* Limit reached */}
          {limitReached && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-sm text-amber-700">
              {t("test.limitReached")}
              <Link href="/signup">
                <span className="block mt-1 text-cyan-600 font-semibold hover:underline cursor-pointer">
                  {t("test.registerNow")} →
                </span>
              </Link>
            </div>
          )}

          {/* Next button */}
          <Button
            onClick={handleNext}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t("test.newImage")}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
