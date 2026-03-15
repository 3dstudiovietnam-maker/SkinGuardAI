/* DermIQ Mole Detail - Timeline, AI Analysis, Photo History */
import { useParams, Link, useLocation } from "wouter";
import { useSkinStore, type AIAnalysis } from "@/contexts/SkinStore";
import { Camera, Trash2, ArrowLeft, GitCompareArrows, AlertTriangle, CheckCircle, Clock, Shield, Share2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MoleDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getMole, deleteMole, updateMole } = useSkinStore();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isPremium = user?.plan === "pro" || user?.plan === "pro_plus";
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const mole = getMole(id || "");

  // Get AI analysis from the most recent photo (if available)
  const analysis: AIAnalysis | null =
    mole && mole.photos.length > 0
      ? (mole.photos[mole.photos.length - 1].aiAnalysis ?? null)
      : null;

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

  const daysSinceLastCheck = Math.floor((Date.now() - mole.lastChecked) / (1000 * 60 * 60 * 24));

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <button className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">{mole.name}</h1>
          <p className="text-sm text-muted-foreground">{mole.region} &middot; {mole.photos.length} {t('moleDetail.photos')}</p>
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
              className={!isPremium ? "text-slate-300 border-slate-200 cursor-not-allowed" : ""}
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
      {analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/60 p-6 mb-6"
        >
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

          {/* Disclaimer from translation */}
          <p className="text-xs text-muted-foreground mt-3 italic leading-relaxed">
            ⚠️ {t('aiDescriptions.AI_DISCLAIMER')}
          </p>
        </motion.div>
      ) : mole && mole.photos.length > 0 ? (
        /* No analysis yet — show info card */
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
          {mole.photos.length >= 2 && (
            <Link href={`/comparison/${mole.id}`}>
              <Button size="sm" variant="outline" className="text-primary border-primary/20">
                <GitCompareArrows className="w-4 h-4 mr-1" /> {t('moleDetail.compare')}
              </Button>
            </Link>
          )}
        </div>
        {mole.photos.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">{t('moleDetail.noPhotos')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
            {[...mole.photos].reverse().map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-muted aspect-square">
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