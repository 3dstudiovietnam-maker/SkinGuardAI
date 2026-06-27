/* DermIQ Mole Detail - Timeline, AI Analysis, Photo History */
import { useParams, Link, useLocation } from "wouter";
import { useSkinStore, type AIAnalysis } from "@/contexts/SkinStore";
import { Camera, Trash2, ArrowLeft, GitCompareArrows, AlertTriangle, CheckCircle, Clock, Shield, Share2, Lock, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { AnimatedLogo } from "@/components/AnimatedLogo";

const biyovisPromoTexts: Record<string, string> = {
  en: "💧 Taking care of your skin is just as important as monitoring it. Biyovis® 4-LEVEL HYDRO ACTIVE hydrating gel provides medical-grade regeneration. 👉 www.biyovis.hu/HU-eng",
  hu: "💧 Bőröd figyelése mellett a megfelelő ápolás is fontos. A Biyovis® 4-LEVEL HYDRO ACTIVE hidratáló gél orvosi minőségű regenerációt nyújt. 👉 www.biyovis.hu/HU-eng",
  vi: "💧 Chăm sóc da cũng quan trọng không kém việc theo dõi. Gel dưỡng ẩm Biyovis® 4-LEVEL HYDRO ACTIVE cung cấp khả năng tái tạo cấp độ y tế. 👉 www.biyovis.hu/HU-eng",
  hi: "💧 आपकी त्वचा की देखभाल करना उतना ही महत्वपूर्ण है जितना उसकी निगरानी करना। Biyovis® 4-LEVEL HYDRO ACTIVE हाइड्रेटिंग जेल मेडिकल-ग्रेड पुनर्जनन प्रदान करता है। 👉 www.biyovis.hu/HU-eng",
  th: "💧 การดูแลผิวของคุณสำคัญพอๆ กับการสังเกตผิว Biyovis® 4-LEVEL HYDRO ACTIVE เจลให้ความชุ่มชื้นคุณภาพทางการแพทย์เพื่อการฟื้นฟูผิว 👉 www.biyovis.hu/HU-eng",
  zh: "💧 护理皮肤与监测皮肤同样重要。Biyovis® 4-LEVEL HYDRO ACTIVE 保湿凝胶提供医疗级修复。 👉 www.biyovis.hu/HU-eng",
  de: "💧 Die Pflege Ihrer Haut ist genauso wichtig wie ihre Überwachung. Biyovis® 4-LEVEL HYDRO ACTIVE feuchtigkeitsspendendes Gel bietet medizinische Regeneration. 👉 www.biyovis.hu/HU-eng",
  es: "💧 Cuidar tu piel es tan importante como monitorearla. El gel hidratante Biyovis® 4-LEVEL HYDRO ACTIVE proporciona regeneración de grado médico. 👉 www.biyovis.hu/HU-eng",
  ru: "💧 Уход за кожей так же важен, как и ее мониторинг. Увлажняющий гель Biyovis® 4-LEVEL HYDRO ACTIVE обеспечивает медицинскую регенерацию. 👉 www.biyovis.hu/HU-eng",
  pt: "💧 Cuidar da sua pele é tão importante quanto monitorizá-la. O gel hidratante Biyovis® 4-LEVEL HYDRO ACTIVE oferece regeneração de grau médico. 👉 www.biyovis.hu/HU-eng",
  ro: "💧 Îngrijirea pielii tale este la fel de importantă ca și monitorizarea acesteia. Gelul hidratant Biyovis® 4-LEVEL HYDRO ACTIVE oferă regenerare de calitate medicală. 👉 www.biyovis.hu/HU-eng",
};

export default function MoleDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getMole, deleteMole, updateMole, userId, isLoading: isMolesLoading } = useSkinStore();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isPremium = user?.plan === "pro" || user?.plan === "pro_plus" || user?.plan === "lifetime";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const mole = getMole(id || "");

  // Load photos from DB (includes analyses data via LEFT JOIN)
  const photosQuery = trpc.photo.getByMoleId.useQuery(
    { moleId: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) && !!mole }
  );
  const photos = photosQuery.data ?? [];

  // Get AI analysis from the most recent photo (if available)
  const lastPhoto = photos.length > 0 ? photos[photos.length - 1] : null;
  const analysis: AIAnalysis | null = lastPhoto?.asymmetryScore != null
    ? {
        asymmetry: { score: lastPhoto.asymmetryScore, descriptionCode: lastPhoto.asymmetryCode ?? "" },
        border: { score: lastPhoto.borderScore!, descriptionCode: lastPhoto.borderCode ?? "" },
        color: { score: lastPhoto.colorScore!, descriptionCode: lastPhoto.colorCode ?? "" },
        diameter: { score: lastPhoto.diameterScore!, descriptionCode: lastPhoto.diameterCode ?? "" },
        overallRisk: (lastPhoto.overallRisk ?? "low") as "low" | "medium" | "high",
        recommendationCode: lastPhoto.recommendationCode ?? "",
        disclaimer: "",
      }
    : null;

  // Show spinner while moles are still loading from DB
  if (isMolesLoading && !mole) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!mole) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-2xl font-bold mb-3">{t('moleDetail.notFound')}</h1>
        <p className="text-muted-foreground mb-6">{t('moleDetail.notFoundDesc')}</p>
        <Link href="/dashboard"><Button className="bg-primary">{t('moleDetail.backToDashboard')}</Button></Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMole(mole.id);
    toast.success(t('moleDetail.deleted'));
    navigate("/dashboard");
  };

  const handleShare = () => {
    if (!isPremium) {
      toast.warning(t('moleDetail.shareUpgrade'));
      return;
    }
    const url = `${window.location.origin}/mole/${mole.id}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success(t('moleDetail.linkCopied')),
      () => toast.error(t('moleDetail.copyFailed'))
    );
  };

  const riskColor = (score: number) => {
    if (score < 30) return "text-green-600 bg-green-50";
    if (score < 50) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };


  const biyovisText = biyovisPromoTexts[language] ?? biyovisPromoTexts['en'];

  const daysSinceLastCheck = Math.floor((Date.now() - mole.lastChecked) / (1000 * 60 * 60 * 24));
  const componentKey = userId || 'no-user';

  return (
    <div key={componentKey} className="container py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <button className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{mole.name}</h1>
          <p className="text-sm text-muted-foreground">{mole.region} &middot; {photos.length} {t('moleDetail.photos')}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/capture/${encodeURIComponent(mole.region)}`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Camera className="w-4 h-4 mr-1" /> {t('moleDetail.addPhoto')}
            </Button>
          </Link>
          <div className="flex flex-col items-center gap-0.5">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              title={isPremium ? t('moleDetail.copyLink') : t('moleDetail.shareUpgrade')}
              className={!isPremium ? "text-slate-300 border-slate-200 dark:border-slate-700 cursor-not-allowed" : ""}
              disabled={!isPremium}
            >
              {isPremium ? <Share2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </Button>
            {!isPremium && (
              <Link href="/pricing">
                <span className="text-[9px] font-semibold text-red-500 hover:underline whitespace-nowrap cursor-pointer">
                  {t('moleDetail.proFeature')}
                </span>
              </Link>
            )}
          </div>
          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Analysis Card */}
      {!photosQuery.isLoading && analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/60 p-6 mb-6"
        >
          {/* Animated logo centred above analysis */}
          <div className="flex justify-center mb-4">
            <AnimatedLogo riskLevel={analysis.overallRisk} size={130} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-lg font-semibold">{t('moleDetail.aiAnalysis')}</h2>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              analysis.overallRisk === "high"
                ? "bg-red-100 text-red-700"
                : analysis.overallRisk === "medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}>
              {analysis.overallRisk === "high" ? t('moleDetail.riskHigh') :
               analysis.overallRisk === "medium" ? t('moleDetail.riskMedium') :
               t('moleDetail.riskLow')} {t('moleDetail.risk')}
            </span>
          </div>

          {/* ABCDE Criteria Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {[
              { label: t('moleDetail.asymmetry'), criterion: analysis.asymmetry, letter: "A" },
              { label: t('moleDetail.border'), criterion: analysis.border, letter: "B" },
              { label: t('moleDetail.color'), criterion: analysis.color, letter: "C" },
              { label: t('moleDetail.diameter'), criterion: analysis.diameter, letter: "D" },
            ].map(item => (
              <div key={item.letter} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-heading font-bold text-sm ${riskColor(item.criterion.score)}`}>
                  {item.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-bold">{item.criterion.score}/100</p>
                  </div>
                  {/* Score bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full mb-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        item.criterion.score < 30 ? "bg-green-500" :
                        item.criterion.score < 60 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${item.criterion.score}%` }}
                    />
                  </div>
                  {/* Description from translation based on code */}
                  {item.criterion.descriptionCode && (
                    <p className="text-xs text-muted-foreground leading-snug">
                      {t(`aiDescriptions.${item.criterion.descriptionCode}`)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Overall recommendation */}
          {analysis.recommendationCode && (
            <div className={`rounded-xl p-4 ${
              analysis.overallRisk === "high"
                ? "bg-red-50 text-red-800 border border-red-200"
                : analysis.overallRisk === "medium"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {analysis.overallRisk === "low" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-semibold text-sm">{t('moleDetail.recommendation')}</span>
              </div>
              <p className="text-sm leading-relaxed">{t(`aiDescriptions.${analysis.recommendationCode}`)}</p>
            </div>
          )}

          {/* Biyovis Promo Card - permanent */}
          <div className="mt-3 bg-gradient-to-r from-blue-50 dark:from-slate-900 to-cyan-50 dark:to-slate-800 border border-blue-200 rounded-xl p-4">
            <a href="https://www.biyovis.hu/HU-eng" target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
              <img
                src="/Biyovislogo.jpg"
                alt="Biyovis® HOLDING"
                className="h-10 w-auto mb-2 object-contain"
              />
              <p className="text-sm text-blue-900 leading-relaxed hover:underline">
                {biyovisText}
              </p>
            </a>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-start gap-2">
            <p className="text-xs text-muted-foreground italic leading-relaxed flex-1">
              ⚠️ {t('aiDescriptions.AI_DISCLAIMER')}
            </p>
            <Link href="/disclaimer">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap shrink-0">
                <ExternalLink className="w-3 h-3" />
                {t('disclaimer.readBtn')}
              </span>
            </Link>
          </div>
        </motion.div>
      ) : null}

      {!photosQuery.isLoading && analysis ? null : !photosQuery.isLoading && photos.length > 0 ? (
        /* Photos exist but no analysis */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/30 rounded-2xl border border-dashed border-border/60 p-6 mb-6 text-center"
        >
          <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">{t('moleDetail.noAnalysis')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('moleDetail.noAnalysisDesc')}
          </p>
        </motion.div>
      ) : null}

      {/* Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('moleDetail.lastChecked')}</span>
          </div>
          <p className="font-heading font-semibold">{daysSinceLastCheck} {t('moleDetail.daysAgo')}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">{t('moleDetail.reminder')}</span>
          </div>
          <p className="font-heading font-semibold">{t('moleDetail.every')} {mole.reminderDays} {t('moleDetail.days')}</p>
          <select
            value={mole.reminderDays}
            onChange={e => updateMole(mole.id, { reminderDays: Number(e.target.value) })}
            className="mt-2 text-xs border border-border rounded-lg px-2 py-1 bg-background"
          >
            <option value={30}>30 {t('moleDetail.days')}</option>
            <option value={60}>60 {t('moleDetail.days')}</option>
            <option value={90}>90 {t('moleDetail.days')}</option>
            <option value={180}>180 {t('moleDetail.days')}</option>
          </select>
        </div>
      </div>

      {/* Photo Timeline */}
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">{t('moleDetail.photoTimeline')}</h2>
          {photos.length >= 2 && (
            <Link href={`/comparison/${mole.id}`}>
              <Button size="sm" variant="outline" className="text-primary border-primary/20">
                <GitCompareArrows className="w-4 h-4 mr-1" /> {t('moleDetail.compare')}
              </Button>
            </Link>
          )}
        </div>
        {photosQuery.isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </div>
        ) : photos.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('moleDetail.noPhotos')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {[...photos].reverse().map(photo => (
              <div key={`${userId}-${photo.id}`} className="relative group rounded-xl overflow-hidden bg-muted aspect-square">
                <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-[10px]">
                    {new Date(photo.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold mb-2">{t('moleDetail.deleteConfirm')}</h3>
            <p className="text-sm text-muted-foreground mb-5">{t('moleDetail.deleteConfirmDesc', { name: mole.name })}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>{t('moleDetail.cancel')}</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>{t('moleDetail.delete')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
