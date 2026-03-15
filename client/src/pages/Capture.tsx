/* DermIQ Capture Page - Camera + Gallery Upload */
import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Camera, Upload, X, Check, RotateCcw, MapPin, Loader2, Lock, RefreshCw } from "lucide-react"; // RefreshCw ikon a váltáshoz
import { Button } from "@/components/ui/button";
import { useSkinStore } from "@/contexts/SkinStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

const BODY_REGION_KEYS = [
  { id: "Head",        key: "bodyMap.regions.head"       },
  { id: "Face",        key: "bodyMap.regions.face"       },
  { id: "Neck",        key: "bodyMap.regions.neck"       },
  { id: "Chest",       key: "bodyMap.regions.chest"      },
  { id: "Abdomen",     key: "bodyMap.regions.abdomen"    },
  { id: "Upper Back",  key: "bodyMap.regions.upperBack"  },
  { id: "Lower Back",  key: "bodyMap.regions.lowerBack"  },
  { id: "Left Arm",    key: "bodyMap.regions.leftArm"    },
  { id: "Right Arm",   key: "bodyMap.regions.rightArm"   },
  { id: "Left Hand",   key: "bodyMap.regions.leftHand"   },
  { id: "Right Hand",  key: "bodyMap.regions.rightHand"  },
  { id: "Left Thigh",  key: "bodyMap.regions.leftThigh"  },
  { id: "Right Thigh", key: "bodyMap.regions.rightThigh" },
  { id: "Left Leg",    key: "bodyMap.regions.leftLeg"    },
  { id: "Right Leg",   key: "bodyMap.regions.rightLeg"   },
  { id: "Left Foot",   key: "bodyMap.regions.leftFoot"   },
  { id: "Right Foot",  key: "bodyMap.regions.rightFoot"  },
];

export default function Capture() {
  const params = useParams<{ region?: string }>();
  const [, navigate] = useLocation();
  const { moles, addMole, addPhotoToMole } = useSkinStore();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const FREE_LIMIT = 10;
  const isPremium = user?.plan === "pro" || user?.plan === "pro_plus" || user?.plan === "lifetime";
  const totalCaptures = moles.reduce((sum, m) => sum + m.photos.length, 0);
  const limitReached = !isPremium && totalCaptures >= FREE_LIMIT;

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [step, setStep] = useState<"capture" | "details">("capture");
  const [moleName, setMoleName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(params.region || "");
  const [existingMoleId, setExistingMoleId] = useState<string>("");
  const [isNewMole, setIsNewMole] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment"); // "user" = előlapi, "environment" = hátlapi

  const analyzeImageMutation = trpc.ai.analyzeImage.useMutation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
    // Ha már van aktív kamera, állítsuk le
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode,
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof DOMException ? err.message : "Camera unavailable";
      toast.error(`Unable to access camera: ${msg}. Please allow camera permissions or upload from gallery.`);
    }
  }, [facingMode]);

  // Kamera váltása előlapi/hátlapi között
  const switchCamera = useCallback(() => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    startCamera(newMode);
  }, [facingMode, startCamera]);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.error("Video play error:", err);
        toast.error("Could not start camera preview. Please try again.");
      });
    }
  }, [cameraActive]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Ha előlapi kamera, tükrözzük a képet, hogy természetes legyen
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Visszaállítás a következő rajzoláshoz
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
      setStep("details");
    }
  }, [stopCamera, facingMode]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setStep("details");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(async () => {
    if (!capturedImage) return;

    if (limitReached) {
      toast.error("You've reached the 10 free scan limit. Upgrade to Pro for unlimited scans.", { duration: 5000 });
      return;
    }

    if (isNewMole) {
      if (!moleName.trim() || !selectedRegion) {
        toast.error(t('capture.errNameRegion'));
        return;
      }
    } else {
      if (!existingMoleId) {
        toast.error(t('capture.errSelectMole'));
        return;
      }
    }

    // Run Vertex AI analysis before saving
    setIsAnalyzing(true);
    let aiAnalysis: import("@/contexts/SkinStore").AIAnalysis | undefined;
    try {
      aiAnalysis = await analyzeImageMutation.mutateAsync({
        imageBase64: capturedImage,
        mimeType: "image/jpeg",
      });
      toast.success("🔬 AI analysis complete!");
    } catch (err: unknown) {
      // Graceful degradation: save without AI analysis if it fails
      const message = err instanceof Error ? err.message : "AI analysis unavailable";
      console.warn("AI analysis failed:", message);
      toast.warning("AI analysis unavailable — saving without it.", {
        description: message,
        duration: 4000,
      });
    } finally {
      setIsAnalyzing(false);
    }

    // Create photo object with required fields
    const photo = {
      dataUrl: capturedImage,
      notes: "",
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      aiAnalysis,
    };

    if (isNewMole) {
      const id = addMole({
        name: moleName.trim(),
        region: selectedRegion,
        photos: [photo],
        reminderDays: 90,
        riskLevel: aiAnalysis
          ? (aiAnalysis.overallRisk === "high" ? "high" : aiAnalysis.overallRisk === "medium" ? "medium" : "low")
          : "unknown",
      });
      toast.success(t('capture.savedSuccess'));
      navigate(`/mole/${id}`);
    } else {
      addPhotoToMole(existingMoleId, photo);
      toast.success(t('capture.photoAdded'));
      navigate(`/mole/${existingMoleId}`);
    }
  }, [capturedImage, isNewMole, moleName, selectedRegion, existingMoleId, addMole, addPhotoToMole, navigate, t, analyzeImageMutation, limitReached]);

  const reset = () => {
    setCapturedImage(null);
    setStep("capture");
    setMoleName("");
    setSelectedRegion(params.region || "");
    setExistingMoleId("");
    stopCamera();
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-3">{t('capture.signInTitle')}</h1>
          <p className="text-muted-foreground mb-6">{t('capture.signInDesc')}</p>
        </div>
      </div>
    );
  }

  // ── Limit reached: full-page upgrade prompt ───────────────────────────────
  if (limitReached) {
    return (
      <div className="container py-16 max-w-lg mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-3 text-slate-900">Free Scan Limit Reached</h1>
          <p className="text-slate-600 mb-2 text-lg">
            You've used all <span className="font-bold text-amber-600">10 free AI scans</span>.
          </p>
          <p className="text-slate-500 mb-8">
            Upgrade to Pro or Pro+ to unlock unlimited AI analyses, detailed reports, and cloud backup.
          </p>

          {/* Usage bar */}
          <div className="bg-slate-100 rounded-full h-3 mb-2 mx-auto max-w-xs">
            <div className="bg-amber-500 h-3 rounded-full w-full" />
          </div>
          <p className="text-xs text-slate-500 mb-8">{totalCaptures} / {FREE_LIMIT} scans used</p>

          {/* Upgrade cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link href="/pricing">
              <div className="p-5 rounded-2xl border-2 border-cyan-500 bg-cyan-50 hover:bg-cyan-100 transition-colors cursor-pointer">
                <p className="font-heading font-bold text-cyan-700 text-lg">Pro</p>
                <p className="text-cyan-600 font-semibold">$6.99 / month</p>
                <p className="text-xs text-slate-500 mt-1">Unlimited scans + cloud backup</p>
              </div>
            </Link>
            <Link href="/pricing">
              <div className="p-5 rounded-2xl border-2 border-violet-500 bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer">
                <p className="font-heading font-bold text-violet-700 text-lg">Pro Plus</p>
                <p className="text-violet-600 font-semibold">$49 / year</p>
                <p className="text-xs text-slate-500 mt-1">Best value · $4.08/month</p>
              </div>
            </Link>
          </div>

          <Link href="/pricing">
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 text-base font-semibold rounded-xl">
              View All Plans →
            </Button>
          </Link>
          <p className="text-xs text-slate-400 mt-4">Your existing 10 scans remain accessible.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="font-heading text-3xl font-bold mb-2">
        {step === "capture" ? t('capture.captureTitle') : t('capture.detailsTitle')}
      </h1>
      <p className="text-muted-foreground mb-4">
        {step === "capture" ? t('capture.captureSubtitle') : t('capture.detailsSubtitle')}
      </p>

      {/* Free tier scan counter — visible when not premium */}
      {!isPremium && (
        <div className={`mb-6 px-4 py-3 rounded-xl flex items-center justify-between text-sm ${FREE_LIMIT - totalCaptures <= 3 ? 'bg-amber-50 border border-amber-300' : 'bg-slate-50 border border-slate-200'}`}>
          <span className={FREE_LIMIT - totalCaptures <= 3 ? 'text-amber-700 font-medium' : 'text-slate-500'}>
            {FREE_LIMIT - totalCaptures <= 3 ? '⚠️ ' : ''}
            <span className="font-bold">{Math.max(0, FREE_LIMIT - totalCaptures)}</span> free scan{FREE_LIMIT - totalCaptures !== 1 ? 's' : ''} remaining
          </span>
          <Link href="/pricing">
            <span className="text-xs text-cyan-600 hover:underline font-semibold cursor-pointer">Upgrade for unlimited →</span>
          </Link>
        </div>
      )}

      {step === "capture" && !cameraActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/60 rounded-2xl p-8"
        >
          <h3 className="font-heading text-2xl font-bold text-slate-900 mb-6">{t('capture.howToTitle')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4 border border-cyan-200/40">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/photo-guide-good-lighting-VBaTFkQqNDHKVDFqjTzbGr.webp" alt={t('capture.goodLighting')} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">{t('capture.goodLighting')}</h4>
              <p className="text-sm text-muted-foreground">{t('capture.goodLightingDesc')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-cyan-200/40">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/photo-guide-straight-angle-im4RHzdeCEp3YkGe7e5fbw.webp" alt={t('capture.straightAngle')} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">{t('capture.straightAngle')}</h4>
              <p className="text-sm text-muted-foreground">{t('capture.straightAngleDesc')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-cyan-200/40">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/photo-guide-close-clear-ax4jkAFvPvwifxMphXMUqa.webp" alt={t('capture.closeAndClear')} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">{t('capture.closeAndClear')}</h4>
              <p className="text-sm text-muted-foreground">{t('capture.closeAndClearDesc')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-cyan-200/40">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/photo-guide-clean-skin-XvV2TF98reSNwkDmyJYyxF.webp" alt={t('capture.cleanSkin')} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h4 className="font-semibold text-slate-900 mb-2">{t('capture.cleanSkin')}</h4>
              <p className="text-sm text-muted-foreground">{t('capture.cleanSkinDesc')}</p>
            </div>
          </div>
        </motion.div>
      )}

      {step === "capture" && !cameraActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h3 className="font-heading text-2xl font-bold text-slate-900 mb-6">{t('capture.tipsTitle')}</h3>
          <div className="bg-white rounded-2xl border border-cyan-200/40 p-6 overflow-x-auto">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/photography-guide_35cf840e.png" alt="Photography Guide" className="w-full h-auto rounded-lg" />
          </div>
        </motion.div>
      )}

      {step === "capture" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-black mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />
              
              {/* Kamera váltó gomb */}
              <button
                onClick={switchCamera}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/80 z-10"
                title="Switch camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                <Button variant="outline" className="bg-white/20 border-white/40 text-white backdrop-blur-sm" onClick={stopCamera}>
                  <X className="w-4 h-4 mr-1" /> {t('capture.cancel')}
                </Button>
                <Button className="bg-primary hover:bg-primary/90 h-14 w-14 rounded-full p-0" onClick={takePhoto}>
                  <div className="w-12 h-12 rounded-full border-2 border-white" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => startCamera()}
                className="flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-heading font-semibold">{t('capture.useCamera')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('capture.useCameraDesc')}</p>
                </div>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-heading font-semibold">{t('capture.uploadPhoto')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('capture.uploadPhotoDesc')}</p>
                </div>
              </button>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}

      {step === "details" && capturedImage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <img src={capturedImage} alt="Captured" className="w-full max-h-80 object-contain" />
            <button
              onClick={reset}
              className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={isNewMole ? "default" : "outline"}
              className={isNewMole ? "bg-primary" : ""}
              onClick={() => setIsNewMole(true)}
            >
              {t('capture.newMole')}
            </Button>
            <Button
              variant={!isNewMole ? "default" : "outline"}
              className={!isNewMole ? "bg-primary" : ""}
              onClick={() => setIsNewMole(false)}
              disabled={moles.length === 0}
            >
              {t('capture.existingMole')}
            </Button>
          </div>

          {isNewMole ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('capture.moleName')}</label>
                <input
                  type="text"
                  placeholder={t('capture.moleNamePlaceholder')}
                  value={moleName}
                  onChange={e => setMoleName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('capture.bodyRegion')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {BODY_REGION_KEYS.map(region => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedRegion === region.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t(region.key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('capture.selectExistingMole')}</label>
              <div className="space-y-2">
                {moles.map(mole => (
                  <button
                    key={mole.id}
                    onClick={() => setExistingMoleId(mole.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                      existingMoleId === mole.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{mole.name}</p>
                      <p className="text-xs text-muted-foreground">{mole.region} &middot; {mole.photos.length} photos</p>
                    </div>
                    {existingMoleId === mole.id && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full bg-primary hover:bg-primary/90 h-12"
            onClick={handleSave}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                🔬 AI Analysis in progress…
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" /> {t('capture.save')}
              </>
            )}
          </Button>
          {isAnalyzing && (
            <p className="text-xs text-muted-foreground text-center animate-pulse">
              Analyzing your mole with Vertex AI (Gemini)… This takes a few seconds.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}