import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, RotateCcw, Loader2, AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

type Step = "upload" | "analyzing" | "result";

interface ABCDEItem {
  score: number;
  descriptionCode: string;
}

interface AnalysisResult {
  asymmetry: ABCDEItem;
  border: ABCDEItem;
  color: ABCDEItem;
  diameter: ABCDEItem;
  overallRisk: "low" | "medium" | "high";
  recommendationCode: string;
  disclaimer: string;
  remainingToday?: number;
}

const RISK_COLORS = {
  low: "bg-green-50 border-green-300 text-green-700",
  medium: "bg-amber-50 border-amber-300 text-amber-700",
  high: "bg-red-50 border-red-300 text-red-700",
};

const RISK_EMOJIS = { low: "✅", medium: "🤔", high: "⚠️" };

export default function TestCapture() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("upload");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const analyzeMutation = trpc.ai.publicAnalyzeImage.useMutation();

  const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setError("Camera unavailable. Please upload a photo instead.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const switchCamera = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (facingMode === "user") {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, c.width, c.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  }, [facingMode, stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setError(null);
    setStep("analyzing");
    try {
      const raw = await analyzeMutation.mutateAsync({
        imageBase64: capturedImage,
        mimeType: "image/jpeg",
      });
      setResult(raw as AnalysisResult);
      setStep("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("too_many") || msg.toLowerCase().includes("daily limit")) {
        setLimitReached(true);
        setError(t("test.limitReached"));
      } else {
        setError(msg);
      }
      setStep("upload");
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setLimitReached(false);
    setStep("upload");
    stopCamera();
  };

  const scoreBar = (score: number) => {
    const color = score > 60 ? "bg-red-400" : score > 30 ? "bg-amber-400" : "bg-green-400";
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-xs text-slate-500 w-7 text-right">{score}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Sub-nav */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { href: "/test", label: t("test.navTest") },
            { href: "/test/knowledge", label: t("test.navKnowledge") },
            { href: "/test/doctors", label: t("test.navDoctors") },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="inline-block px-4 py-3 text-sm font-medium text-slate-600 hover:text-cyan-600 whitespace-nowrap border-b-2 border-transparent hover:border-cyan-500 transition-colors cursor-pointer">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/test">
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-600 cursor-pointer mb-6">
            <ChevronLeft className="w-4 h-4" />
            {t("test.backToTest")}
          </span>
        </Link>

        <h1 className="font-heading text-2xl font-bold text-slate-900 mb-1">{t("test.tryOwnPhoto")}</h1>
        <p className="text-slate-500 text-sm mb-6">{t("test.disclaimer")}</p>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                {limitReached && (
                  <Link href="/signup">
                    <span className="text-sm font-semibold text-cyan-600 hover:underline cursor-pointer">
                      {t("test.registerNow")} →
                    </span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload step */}
        {step === "upload" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Camera active */}
            {cameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black mb-4">
                <video ref={videoRef} autoPlay playsInline muted className="w-full" />
                <button
                  onClick={switchCamera}
                  className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <Button variant="outline" className="bg-white/20 border-white/40 text-white backdrop-blur-sm" onClick={stopCamera}>
                    ✕
                  </Button>
                  <button
                    onClick={takePhoto}
                    className="w-14 h-14 rounded-full bg-white border-4 border-cyan-500 hover:bg-cyan-50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Captured image preview */}
            {capturedImage && !cameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black mb-4">
                <img src={capturedImage} alt="Captured" className="w-full max-h-80 object-contain" />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Buttons if no image yet and no camera */}
            {!capturedImage && !cameraActive && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => startCamera()}
                  className="flex flex-col items-center gap-3 py-8 rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50 hover:bg-cyan-100 transition-colors"
                >
                  <Camera className="w-8 h-8 text-cyan-600" />
                  <span className="text-sm font-semibold text-cyan-700">{t("test.takePhoto")}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 py-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-600">{t("test.uploadPhoto")}</span>
                </button>
              </div>
            )}

            {/* Analyze button */}
            {capturedImage && !cameraActive && (
              <Button
                onClick={handleAnalyze}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl h-12 text-base font-semibold"
              >
                {t("test.analyze")}
              </Button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <canvas ref={canvasRef} className="hidden" />

            {/* Upload/take hint */}
            {!capturedImage && !cameraActive && (
              <p className="text-xs text-center text-slate-400 mt-4">{t("test.uploadOrTake")}</p>
            )}
          </motion.div>
        )}

        {/* Analyzing step */}
        {step === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            {capturedImage && (
              <img src={capturedImage} alt="Analyzing" className="w-40 h-40 object-cover rounded-2xl shadow" />
            )}
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mt-4" />
            <p className="text-slate-600 font-medium">{t("test.analyzing")}</p>
          </motion.div>
        )}

        {/* Result step */}
        {step === "result" && result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {capturedImage && (
              <img src={capturedImage} alt="Analyzed" className="w-full max-h-64 object-contain rounded-2xl shadow" />
            )}

            {/* Risk badge */}
            <div className={`p-4 rounded-2xl border-2 text-center ${RISK_COLORS[result.overallRisk]}`}>
              <span className="text-3xl mr-2">{RISK_EMOJIS[result.overallRisk]}</span>
              <span className="text-xl font-bold uppercase">{result.overallRisk} Risk</span>
            </div>

            {/* ABCDE scores */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">{t("test.result")}</h3>
              {[
                { key: "asymmetry", label: "A – Asymmetry" },
                { key: "border", label: "B – Border" },
                { key: "color", label: "C – Color" },
                { key: "diameter", label: "D – Diameter" },
              ].map(({ key, label }) => {
                const item = result[key as keyof AnalysisResult] as ABCDEItem;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-medium">{label}</span>
                    </div>
                    {scoreBar(item.score)}
                  </div>
                );
              })}
            </div>

            {/* Remaining */}
            {result.remainingToday !== undefined && (
              <p className="text-xs text-center text-slate-400">
                {t("test.dailyLimit").replace("{{count}}", String(result.remainingToday))}
              </p>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 text-center leading-relaxed">{t("test.disclaimer")}</p>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={reset} className="rounded-xl">
                <RotateCcw className="w-4 h-4 mr-1" /> {t("test.uploadPhoto")}
              </Button>
              <Link href="/signup">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl">
                  {t("test.tryApp")} →
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
