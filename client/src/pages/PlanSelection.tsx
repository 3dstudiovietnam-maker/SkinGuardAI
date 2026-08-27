import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Gift, Shield, Star, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { openCheckout } from "@/lib/checkout";

// WEB-ONLY MODULE — Apple 2.3.1 / 3.1.1.
//
// The post-login plan chooser is the second paywall of the app. It used to live
// inside LogIn.tsx behind a runtime `isNative` check, which meant the price
// cards and the checkout links were still shipped inside the App Store binary,
// merely not rendered. Apple treats that as a hidden, dormant feature.
//
// It now lives in its own module, imported only from the web branch of
// LogIn.tsx (`__NATIVE_BUILD__ ? null : lazy(() => import("./PlanSelection"))`).
// In the native build that import is dead code, so this file — every price
// string and every checkout URL in it — never reaches the bundle.

const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

export default function PlanSelection() {
  const { t } = useLanguage();
  // The buyer is signed in on this screen, so their id can travel with the
  // checkout and the webhook can unlock the plan the moment it is paid.
  const { user } = useAuth();
  const updatePlanMutation = trpc.auth.updatePlan.useMutation();
  const redeemMutation = trpc.auth.redeemPromoCode.useMutation();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [planPromoCode, setPlanPromoCode] = useState("");
  const [planPromoError, setPlanPromoError] = useState("");
  const [planPromoSuccess, setPlanPromoSuccess] = useState(false);
  const [planPromoLoading, setPlanPromoLoading] = useState(false);

  const handlePlanSelect = async (plan: "essential" | "pro" | "pro_plus") => {
    setIsLoading(true);
    try {
      await updatePlanMutation.mutateAsync({ plan });
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to update plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanPromoRedeem = async () => {
    if (!planPromoCode.trim()) return;
    setPlanPromoLoading(true);
    setPlanPromoError("");
    try {
      await redeemMutation.mutateAsync({ code: planPromoCode.trim() });
      localStorage.removeItem("skinguard_pending_promo");
      setPlanPromoSuccess(true);
      setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
    } catch (err: any) {
      setPlanPromoError(err.message || "Invalid promo code. Please try again.");
    } finally {
      setPlanPromoLoading(false);
    }
  };

  const handleCardAction = async (id: "essential" | "pro" | "pro_plus" | "lifetime") => {
    if (id === "essential") {
      await handlePlanSelect("essential");
      return;
    }
    // Every card opens the checkout of the plan it advertises. This used to be a
    // real bug: every paid card except Lifetime opened the monthly Pro product,
    // so the "$49/year" Pro Plus card charged a different price than the one
    // printed on it.
    openCheckout(id, { id: (user as any)?.id, email: (user as any)?.email });
  };

    const planCards = [
      {
        id: "essential" as const,
        name: "Essential",
        price: "$0",
        priceNoteKey: "pricing.freeForever",
        badgeKey: null as string | null,
        featureKeys: ["pricing.feat_1", "pricing.feat_2", "pricing.feat_3", "pricing.feat_4", "pricing.feat_5"],
        ctaKey: "pricing.ctaStartFree",
        special: "10 free scans",
      },
      {
        id: "pro" as const,
        name: "Pro",
        price: "$6.90",
        priceNoteKey: "pricing.perMonth",
        badgeKey: "pricing.mostPopular",
        featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
        ctaKey: "pricing.ctaGetPro",
        special: "Unlimited scans",
      },
      {
        id: "pro_plus" as const,
        name: "Pro Plus",
        price: "$49",
        priceNoteKey: "pricing.perYear",
        badgeKey: "pricing.bestAnnualValue",
        featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
        ctaKey: "pricing.ctaGetProPlus",
        special: "Unlimited scans",
      },
      {
        id: "lifetime" as const,
        name: "Lifetime",
        price: "$79",
        priceNoteKey: "pricing.oneTime",
        badgeKey: "pricing.bestDeal",
        featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
        ctaKey: "pricing.ctaGetLifetime",
        special: "Unlimited scans",
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t("auth.choosePlan")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {t("auth.choosePlanSubtitle")}
            </p>
          </div>

          {/* Plans Grid - Teljes kártya kattintható */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Essential */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("essential")}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col cursor-pointer hover:border-cyan-300 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="font-heading text-xl font-bold">Essential</h3>
              </div>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-3xl font-bold">$0</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t("pricing.freeForever")}</p>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-amber-700">⚡ {planCards[0].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[0].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro — Most Popular */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("pro")}
              className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-cyan-600 p-6 flex flex-col relative cursor-pointer hover:border-cyan-700 transition-all"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3 h-3" /> {t("pricing.mostPopular")}
              </div>
              <h3 className="font-heading text-xl font-bold mt-4">Pro</h3>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-3xl font-bold">$6.90</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm pb-1">{t("pricing.perMonth")}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t("pricing.advancedAI")}</p>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-green-700">∞ {planCards[1].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[1].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro Plus */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("pro_plus")}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col cursor-pointer hover:border-cyan-300 transition-all"
            >
              <h3 className="font-heading text-xl font-bold mb-2">Pro Plus</h3>
              <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                <span className="font-heading text-3xl font-bold">$49</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm pb-1">{t("pricing.perYear")}</span>
                <span className="text-slate-400 text-xs pb-1">($4.08/hó)</span>
              </div>
              <div className="mt-2 mb-4">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  {t("pricing.bestAnnualValue")} — {t("pricing.save41")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-green-700">∞ {planCards[2].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[2].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Lifetime */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("lifetime")}
              className="bg-gradient-to-b from-amber-50 dark:from-slate-900 to-white dark:to-slate-900 rounded-2xl border-2 border-amber-400 p-6 flex flex-col relative cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <Zap className="w-3 h-3" /> {t("pricing.bestDeal")}
              </div>
              <h3 className="font-heading text-xl font-bold mt-4">Lifetime</h3>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-3xl font-bold">$79</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm pb-1">{t("pricing.oneTime")}</span>
              </div>
              <p className="text-sm text-amber-600 mb-4">{t("pricing.payOnce")}</p>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-green-700">∞ {planCards[3].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[3].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Promo Code Redemption on Plan Selection ── */}
          <div className="mt-10 max-w-md mx-auto">
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800 text-sm">{t("auth.havePromoCode")}</span>
              </div>
              {planPromoSuccess ? (
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>{t("auth.promoActivated")}</span>
                </div>
              ) : (
                <>
                  {planPromoError && (
                    <p className="text-sm text-red-600 mb-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {planPromoError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={planPromoCode}
                      onChange={e => { setPlanPromoCode(e.target.value.toUpperCase()); setPlanPromoError(""); }}
                      placeholder={t("auth.promoCodePlaceholder") || "e.g. SKIN-LT-0550"}
                      className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm uppercase tracking-wider bg-white dark:bg-slate-900"
                      disabled={planPromoLoading}
                      onKeyDown={e => e.key === "Enter" && handlePlanPromoRedeem()}
                    />
                    <Button
                      onClick={handlePlanPromoRedeem}
                      disabled={planPromoLoading || !planPromoCode.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 rounded-lg font-semibold"
                    >
                      {planPromoLoading ? "..." : t("auth.activateBtn")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    );
}
