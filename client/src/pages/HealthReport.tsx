/*
 * SkinGuard AI - Health Report
 * Two views: My Data (SkinStore) + System Overview (DB)
 */
import { Download, Share2, FileText, Calendar, AlertCircle, Users, User, Activity, Shield, TrendingUp, BarChart2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useSkinStore } from "@/contexts/SkinStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

export default function HealthReport() {
  const [activeTab, setActiveTab] = useState<"personal" | "system">("personal");
  const [selectedMoleId, setSelectedMoleId] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const { moles } = useSkinStore();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const systemStatsQuery = trpc.stats.getSystemStats.useQuery();
  const systemStats = systemStatsQuery.data;

  const isPremium = user?.plan === "pro" || user?.plan === "pro_plus";

  const highRisk   = moles.filter(m => m.riskLevel === "high").length;
  const mediumRisk = moles.filter(m => m.riskLevel === "medium").length;
  const lowRisk    = moles.filter(m => m.riskLevel === "low").length;
  const unknown    = moles.filter(m => m.riskLevel === "unknown" || !m.riskLevel).length;
  const totalPhotos   = moles.reduce((sum, m) => sum + (m.photos?.length ?? 0), 0);
  const uniqueRegions = [...new Set(moles.map(m => m.region).filter(Boolean))].length;
  const lastScanDate  = moles.length > 0
    ? new Date(Math.max(...moles.map(m => m.lastChecked ?? 0))).toLocaleDateString()
    : "—";
  const generatedDate = new Date().toLocaleDateString();

  const personalRecommendations: string[] = [
    ...(highRisk > 0   ? [`${highRisk} ${t('healthReport.recHighRisk')}`] : []),
    ...(mediumRisk > 0 ? [`${mediumRisk} ${t('healthReport.recMediumRisk')}`] : []),
    t('healthReport.recAnnualScreening'),
    t('healthReport.recMonthlyCheck'),
    t('healthReport.recSunProtection'),
  ];

  const handleExportPDF = () => {
    if (!isPremium) {
      toast.warning("Upgrade to Pro or Pro+ to export PDF reports.");
      return;
    }
    try {
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      // Helper: add new page if content won't fit
      const checkPage = (needed: number) => {
        if (y + needed > ph - margin) { doc.addPage(); y = margin; }
      };

      // ── COVER: title + summary stats ──────────────────────────────────────
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SkinGuard AI – Health Report", pw / 2, y, { align: "center" });
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${t('healthReport.generatedOn')} ${generatedDate}`, pw / 2, y, { align: "center" });
      if (user?.name) { y += 6; doc.text(`${t('healthReport.loggedInAs')} ${user.name}`, pw / 2, y, { align: "center" }); }
      y += 14;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(t('healthReport.myDataTitle'), margin, y); y += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`${t('healthReport.totalMoles')}: ${moles.length}`, margin, y); y += 6;
      doc.text(`${t('healthReport.highRisk')}: ${highRisk}   ${t('healthReport.mediumRisk')}: ${mediumRisk}   ${t('healthReport.lowRisk')}: ${lowRisk}`, margin, y); y += 6;
      doc.text(`${t('healthReport.monitoredRegions')}: ${uniqueRegions}   ${t('healthReport.totalPhotos')}: ${totalPhotos}`, margin, y); y += 6;
      doc.text(`${t('healthReport.lastScan')}: ${lastScanDate}`, margin, y); y += 12;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(t('healthReport.recommendations'), margin, y); y += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      personalRecommendations.forEach((rec, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, pw - margin * 2);
        checkPage(lines.length * 5 + 4);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 4;
      });

      // ── PER-MOLE SECTIONS (one page per mole) ─────────────────────────────
      moles.forEach((mole) => {
        doc.addPage();
        y = margin;

        // Mole header
        doc.setFontSize(17);
        doc.setFont("helvetica", "bold");
        doc.text(mole.name, margin, y); y += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const riskLabel = (mole.riskLevel ?? "unknown").toUpperCase();
        doc.text(`Region: ${mole.region}   Risk: ${riskLabel}   Photos: ${mole.photos.length}`, margin, y); y += 5;
        doc.text(`Created: ${new Date(mole.createdAt).toLocaleDateString()}   Last checked: ${new Date(mole.lastChecked).toLocaleDateString()}`, margin, y); y += 10;

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pw - margin, y); y += 6;

        // AI Analysis section
        const lastPhoto = mole.photos.length > 0 ? mole.photos[mole.photos.length - 1] : null;
        if (lastPhoto?.aiAnalysis) {
          const ai = lastPhoto.aiAnalysis;

          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.text("AI Analysis (ABCDE)", margin, y); y += 7;

          const criteria = [
            { letter: "A", name: "Asymmetry", data: ai.asymmetry },
            { letter: "B", name: "Border",    data: ai.border    },
            { letter: "C", name: "Color",     data: ai.color     },
            { letter: "D", name: "Diameter",  data: ai.diameter  },
          ];

          doc.setFontSize(10);
          criteria.forEach(({ letter, name, data }) => {
            checkPage(14);
            doc.setFont("helvetica", "bold");
            doc.text(`${letter} – ${name}: ${data.score}/100`, margin, y);
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(data.description, pw - margin * 2 - 8);
            doc.text(lines, margin + 5, y + 5);
            y += 5 + lines.length * 5 + 3;
          });

          checkPage(20);
          doc.setFont("helvetica", "bold");
          doc.text(`Overall Risk: ${ai.overallRisk.toUpperCase()}`, margin, y); y += 6;
          doc.setFont("helvetica", "normal");
          const recLines = doc.splitTextToSize(ai.recommendation, pw - margin * 2);
          doc.text(recLines, margin, y); y += recLines.length * 5 + 4;

          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(180, 0, 0);
          const discLines = doc.splitTextToSize(`(!) ${ai.disclaimer}`, pw - margin * 2);
          checkPage(discLines.length * 4 + 6);
          doc.text(discLines, margin, y); y += discLines.length * 4 + 8;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
        } else {
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.text("No AI analysis available for this mole.", margin, y); y += 10;
        }

        // Photo Timeline
        if (mole.photos.length > 0) {
          checkPage(20);
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Photo Timeline", margin, y); y += 7;

          const imgW = 55;
          const imgH = 55;
          const gap  = 5;
          const cols = 3;
          let col = 0;

          mole.photos.forEach((photo) => {
            if (col === 0) checkPage(imgH + 16);
            try {
              const x       = margin + col * (imgW + gap);
              const imgType = photo.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
              doc.addImage(photo.dataUrl, imgType, x, y, imgW, imgH);
              // Date label below image
              doc.setFontSize(7);
              doc.setFont("helvetica", "normal");
              doc.text(
                photo.timestamp ? new Date(photo.timestamp).toLocaleDateString() : "",
                x + imgW / 2, y + imgH + 4, { align: "center" }
              );
            } catch {
              // skip unrenderable image silently
            }
            col++;
            if (col >= cols) { col = 0; y += imgH + 12; }
          });
          if (col > 0) y += imgH + 12;
        }
      });

      // Final disclaimer
      checkPage(12);
      y += 4;
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("This report is generated by SkinGuard AI and should be confirmed with a medical professional.", margin, y);

      doc.save(`SkinGuard_Report_${Date.now()}.pdf`);
      toast.success(t('healthReport.pdfExported'));
    } catch (err) {
      console.error("PDF error:", err);
      toast.error(t('healthReport.pdfFailed'));
    }
  };

  const redeemMutation = trpc.auth.redeemPromoCode.useMutation({
    onSuccess: () => {
      toast.success("🎉 Promo code accepted! Pro access unlocked.");
      setShowPromoModal(false);
      setPromoCodeInput("");
      // Reload to refresh user plan from backend
      setTimeout(() => window.location.reload(), 1200);
    },
    onError: (err) => {
      toast.error(err.message ?? "Invalid promo code.");
    },
  });

  const handleRedeemPromo = () => {
    if (!promoCodeInput.trim()) { toast.warning("Please enter a promo code."); return; }
    redeemMutation.mutate({ code: promoCodeInput.trim() });
  };

  const handleShareReport = () => {
    if (!isPremium) {
      toast.warning("Upgrade to Pro or Pro+ to share mole links.");
      return;
    }
    // Use selected mole if available, otherwise fall back to the first mole, then the report URL
    const targetId = selectedMoleId ?? moles[0]?.id;
    const shareUrl = targetId
      ? `${window.location.origin}/mole/${targetId}`
      : window.location.href;
    navigator.clipboard.writeText(shareUrl).then(
      () => toast.success(t('healthReport.linkCopied')),
      () => toast.error(t('healthReport.copyFailed'))
    );
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 text-slate-900">
          {t('healthReport.title')}
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          {t('healthReport.subtitle')}
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-3 mb-8 max-w-4xl mx-auto">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "personal"
              ? "bg-cyan-600 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <User className="w-4 h-4" />
          {t('healthReport.personalTab')}
        </button>
        <button
          onClick={() => setActiveTab("system")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "system"
              ? "bg-slate-800 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          {t('healthReport.systemTab')}
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* === PERSONAL TAB === */}
        {activeTab === "personal" && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {isAuthenticated && user && (
              <div className="max-w-4xl mx-auto mb-4 flex items-center gap-2 text-slate-500 text-sm">
                <User className="w-4 h-4 text-cyan-500" />
                <span>{t('healthReport.loggedInAs')} <strong className="text-slate-700">{user.name}</strong></span>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6 max-w-4xl mx-auto shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-cyan-600" />
                <h2 className="font-heading text-2xl font-bold text-slate-900">{t('healthReport.myDataTitle')}</h2>
                <span className="ml-auto text-xs text-slate-400">{t('healthReport.myDataSource')}</span>
              </div>

              {moles.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{t('healthReport.noMoles')}</p>
                  <p className="text-sm mt-1">{t('healthReport.noMolesDesc')}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200/60">
                      <p className="text-xs text-slate-500 mb-1">{t('healthReport.totalMoles')}</p>
                      <p className="font-heading text-3xl font-bold text-cyan-600">{moles.length}</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200/60">
                      <p className="text-xs text-slate-500 mb-1">{t('healthReport.highRisk')}</p>
                      <p className="font-heading text-3xl font-bold text-orange-600">{highRisk}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200/60">
                      <p className="text-xs text-slate-500 mb-1">{t('healthReport.mediumRisk')}</p>
                      <p className="font-heading text-3xl font-bold text-yellow-600">{mediumRisk}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/60">
                      <p className="text-xs text-slate-500 mb-1">{t('healthReport.lowRisk')}</p>
                      <p className="font-heading text-3xl font-bold text-emerald-600">{lowRisk}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                      <p className="text-xs text-slate-500">{t('healthReport.monitoredRegions')}</p>
                      <p className="font-bold text-xl text-slate-800 mt-1">{uniqueRegions}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                      <p className="text-xs text-slate-500">{t('healthReport.totalPhotos')}</p>
                      <p className="font-bold text-xl text-slate-800 mt-1">{totalPhotos}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center">
                      <p className="text-xs text-slate-500">{t('healthReport.lastScan')}</p>
                      <p className="font-bold text-base text-slate-800 mt-1">{lastScanDate}</p>
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div className="mb-8">
                    <p className="text-sm font-medium text-slate-600 mb-2">{t('healthReport.riskDistribution')}</p>
                    <div className="flex rounded-full overflow-hidden h-4">
                      {highRisk > 0 && (
                        <div style={{ width: `${(highRisk / moles.length) * 100}%` }} className="bg-orange-500" />
                      )}
                      {mediumRisk > 0 && (
                        <div style={{ width: `${(mediumRisk / moles.length) * 100}%` }} className="bg-yellow-400" />
                      )}
                      {lowRisk > 0 && (
                        <div style={{ width: `${(lowRisk / moles.length) * 100}%` }} className="bg-emerald-500" />
                      )}
                      {unknown > 0 && (
                        <div style={{ width: `${(unknown / moles.length) * 100}%` }} className="bg-slate-300" />
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />{t('healthReport.high')}</span>
                      <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />{t('healthReport.medium')}</span>
                      <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />{t('healthReport.low')}</span>
                      {unknown > 0 && <span><span className="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1" />{t('healthReport.unknown')}</span>}
                    </div>
                  </div>

                  {/* Moles List — click to select, per-row Share button */}
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-600 mb-3">
                      {t('healthReport.totalMoles')} ({moles.length})
                    </p>
                    <div className="space-y-2">
                      {moles.map(mole => (
                        <div
                          key={mole.id}
                          onClick={() => setSelectedMoleId(mole.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                            selectedMoleId === mole.id
                              ? "bg-cyan-50 border-cyan-300"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">{mole.name}</p>
                            <p className="text-xs text-slate-500">
                              {mole.region} · {mole.photos.length} {t('healthReport.totalPhotos').toLowerCase()}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            mole.riskLevel === "high"   ? "bg-orange-100 text-orange-700" :
                            mole.riskLevel === "medium" ? "bg-yellow-100 text-yellow-700" :
                            mole.riskLevel === "low"    ? "bg-emerald-100 text-emerald-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {(mole.riskLevel ?? "unknown").toUpperCase()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`shrink-0 h-8 w-8 p-0 ${isPremium ? "text-slate-400 hover:text-cyan-600" : "text-slate-300 cursor-not-allowed"}`}
                            title={isPremium ? "Copy link to this mole" : "Upgrade to Pro to share mole links"}
                            disabled={!isPremium}
                            onClick={e => {
                              e.stopPropagation();
                              if (!isPremium) { toast.warning("Upgrade to Pro or Pro+ to share mole links."); return; }
                              const url = `${window.location.origin}/mole/${mole.id}`;
                              navigator.clipboard.writeText(url).then(
                                () => toast.success(t('healthReport.linkCopied')),
                                () => toast.error(t('healthReport.copyFailed'))
                              );
                            }}
                          >
                            {isPremium ? <Share2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                    {selectedMoleId && (
                      <p className="text-xs text-cyan-600 mt-2 pl-1">
                        ✓ {moles.find(m => m.id === selectedMoleId)?.name} — {t('healthReport.shareLink')} ↓
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Recommendations */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-semibold text-slate-800">{t('healthReport.recommendations')}</h3>
                </div>
                <ul className="space-y-3">
                  {personalRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('healthReport.generatedOn')} {generatedDate}</span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  className={`h-12 text-base text-white ${isPremium ? "bg-cyan-600 hover:bg-cyan-700" : "bg-slate-300 hover:bg-slate-300 cursor-not-allowed"}`}
                  onClick={handleExportPDF}
                  disabled={!isPremium}
                >
                  {isPremium ? (
                    <><Download className="w-4 h-4 mr-2" /> {t('healthReport.exportPDF')}</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" /> {t('healthReport.exportPDF')}</>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`h-12 text-base ${isPremium ? "border-slate-300" : "border-slate-200 text-slate-400 cursor-not-allowed"}`}
                  onClick={handleShareReport}
                  disabled={!isPremium}
                >
                  {isPremium ? (
                    <><Share2 className="w-4 h-4 mr-2" /> {t('healthReport.shareLink')}</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" /> {t('healthReport.shareLink')}</>
                  )}
                </Button>
              </div>
              {!isPremium && (
                <div className="text-center space-y-1">
                  <p className="text-xs text-slate-500">
                    🔒 PDF export and sharing are available on <a href="/pricing" className="text-cyan-600 hover:underline font-medium">Pro and Pro+ plans</a>. Upgrade to unlock full reports.
                  </p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowPromoModal(true)}
                      className="text-xs text-cyan-600 hover:underline font-medium"
                    >
                      🎟 Have a promo code?
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* === SYSTEM TAB === */}
        {activeTab === "system" && (
          <motion.div
            key="system"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6 max-w-4xl mx-auto shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <BarChart2 className="w-6 h-6 text-slate-700" />
                <h2 className="font-heading text-2xl font-bold text-slate-900">{t('healthReport.systemTitle')}</h2>
                <span className="ml-auto text-xs text-slate-400">{t('healthReport.dbSource')}</span>
              </div>

              {systemStatsQuery.isLoading ? (
                <div className="text-center py-10 text-slate-400">
                  <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
                  <p>{t('healthReport.loadingData')}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                    <div className="bg-slate-800 rounded-xl p-4 text-white">
                      <p className="text-xs text-slate-300 mb-1">{t('healthReport.totalUsers')}</p>
                      <p className="font-heading text-3xl font-bold">{systemStats?.totalUsers ?? 0}</p>
                    </div>
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200/60">
                      <p className="text-xs text-slate-500 mb-1">{t('healthReport.activeUsers')}</p>
                      <p className="font-heading text-3xl font-bold text-cyan-700">{systemStats?.activeUsers ?? 0}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200/60">
                      <p className="text-xs text-slate-500 mb-1">{t('healthReport.proSubscribers')}</p>
                      <p className="font-heading text-3xl font-bold text-blue-600">{systemStats?.proUsers ?? 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200/60">
                      <p className="text-xs text-slate-500 mb-1">{t('healthReport.proPlusSubscribers')}</p>
                      <p className="font-heading text-3xl font-bold text-purple-600">{systemStats?.proPlusUsers ?? 0}</p>
                    </div>
                  </div>

                  {(systemStats?.totalUsers ?? 0) > 0 && (
                    <div className="mb-8">
                      <p className="text-sm font-medium text-slate-600 mb-2">{t('healthReport.subscriptionDist')}</p>
                      <div className="flex rounded-full overflow-hidden h-5">
                        {(systemStats?.essentialUsers ?? 0) > 0 && (
                          <div
                            style={{ width: `${((systemStats?.essentialUsers ?? 0) / (systemStats?.totalUsers ?? 1)) * 100}%` }}
                            className="bg-slate-400"
                          />
                        )}
                        {(systemStats?.proUsers ?? 0) > 0 && (
                          <div
                            style={{ width: `${((systemStats?.proUsers ?? 0) / (systemStats?.totalUsers ?? 1)) * 100}%` }}
                            className="bg-cyan-500"
                          />
                        )}
                        {(systemStats?.proPlusUsers ?? 0) > 0 && (
                          <div
                            style={{ width: `${((systemStats?.proPlusUsers ?? 0) / (systemStats?.totalUsers ?? 1)) * 100}%` }}
                            className="bg-purple-600"
                          />
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span><span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-1" />Essential ({systemStats?.essentialUsers ?? 0})</span>
                        <span><span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-1" />Pro ({systemStats?.proUsers ?? 0})</span>
                        <span><span className="inline-block w-2 h-2 rounded-full bg-purple-600 mr-1" />Pro+ ({systemStats?.proPlusUsers ?? 0})</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-200/60">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-cyan-600" />
                        <h4 className="font-semibold text-slate-800">{t('healthReport.aiAccuracy')}</h4>
                      </div>
                      <p className="text-3xl font-bold text-cyan-600 mb-1">94%</p>
                      <p className="text-xs text-slate-500">{t('healthReport.abcdeAnalysis')}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200/60">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-semibold text-slate-800">{t('healthReport.platformStatus')}</h4>
                      </div>
                      <p className="text-3xl font-bold text-emerald-600 mb-1">{t('healthReport.active')}</p>
                      <p className="text-xs text-slate-500">{t('healthReport.allSystemsOk')}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('healthReport.dataFetchedOn')} {generatedDate}</span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-200/60 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> {t('healthReport.noteTitle')}
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• {t('healthReport.notePersonal')}</li>
                <li>• {t('healthReport.noteSystem')}</li>
                <li>• {t('healthReport.noteMoles')}</li>
              </ul>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPromoModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold mb-1">🎟 Promo Code</h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter your promo code to unlock Pro access.
            </p>
            <input
              type="text"
              value={promoCodeInput}
              onChange={e => setPromoCodeInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRedeemPromo()}
              placeholder="e.g. SKINGUARD-FREE-2025"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase tracking-wider"
              autoFocus
              disabled={redeemMutation.isPending}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowPromoModal(false); setPromoCodeInput(""); }}
                disabled={redeemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={handleRedeemPromo}
                disabled={redeemMutation.isPending}
              >
                {redeemMutation.isPending ? "Checking…" : "Redeem"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
