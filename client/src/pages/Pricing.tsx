/* SkinGuard AI Pricing */
import { Check, X, Star, HelpCircle, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Types ────────────────────────────────────────────────────────────────────
type PlanKey = "essential" | "pro" | "proPlus" | "lifetime";

interface PlanFeature {
  nameKey: string;
  essential: boolean;
  pro: boolean;
  proPlus: boolean;
  lifetime: boolean;
}

// Feature list – keys mapped to translations
const ALL_FEATURES: PlanFeature[] = [
  { nameKey: "pricing.feat_1",  essential: true,  pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_2",  essential: true,  pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_3",  essential: true,  pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_4",  essential: true,  pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_5",  essential: true,  pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_6",  essential: false, pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_7",  essential: false, pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_8",  essential: false, pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_9",  essential: false, pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_10", essential: false, pro: true, proPlus: true, lifetime: true },
  { nameKey: "pricing.feat_11", essential: false, pro: true, proPlus: true, lifetime: true },
];

// Hover spring
const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

// ── FeatureList sub-component ─────────────────────────────────────────────────
function FeatureList({ plan, t }: { plan: PlanKey; t: (k: string) => string }) {
  return (
    <ul className="space-y-2.5 flex-1 mt-2">
      {ALL_FEATURES.map((f: PlanFeature) => {
        const included: boolean = f[plan];
        return (
          <li key={f.nameKey} className="flex items-center gap-2.5 text-sm">
            {included
              ? <Check className="w-4 h-4 text-primary shrink-0" />
              : <X     className="w-4 h-4 text-muted-foreground/40 shrink-0" />
            }
            <span className={included ? "text-foreground" : "text-muted-foreground/50"}>
              {t(f.nameKey)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Main Pricing page ─────────────────────────────────────────────────────────
export default function Pricing() {
  const { t } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openGumroad = (url: string) => window.open(url, "_blank");

  // FAQ items built from translations
  const FAQS = [
    { q: t('pricing.pfaq_q1'), a: t('pricing.pfaq_a1') },
    { q: t('pricing.pfaq_q2'), a: t('pricing.pfaq_a2') },
    { q: t('pricing.pfaq_q3'), a: t('pricing.pfaq_a3') },
    { q: t('pricing.pfaq_q4'), a: t('pricing.pfaq_a4') },
    { q: t('pricing.pfaq_q5'), a: t('pricing.pfaq_a5') },
    { q: t('pricing.pfaq_q6'), a: t('pricing.pfaq_a6') },
  ];

  return (
    <div className="container py-12">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          {t('pricing.subtitle')}
        </p>

        {/* ── Billing Toggle ── */}
        <div className="inline-flex items-center gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
              billingPeriod === "monthly"
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('pricing.monthly')}
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              billingPeriod === "annual"
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t('pricing.annual')}
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
              {t('pricing.save41')}
            </span>
          </button>
        </div>
      </motion.div>

      {/* ── Plan cards with AnimatePresence transition ── */}
      <AnimatePresence mode="wait">

        {/* ── MONTHLY: Show all 4 plans ── */}
        {billingPeriod === "monthly" && (
          <motion.div
            key="monthly-grid"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-16"
          >

            {/* Essential */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              className="bg-card rounded-2xl border border-border/60 p-7 flex flex-col cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-heading text-xl font-bold">Essential</h3>
              </div>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-4xl font-bold">$0</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t('pricing.freeForever')}</p>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-amber-700">⚡ 10 {t('pricing.freeScans') || 'ingyenes AI elemzés'}</span>
              </div>
              <Button variant="outline" className="w-full mb-4 border-primary/30 text-primary hover:bg-primary/5">
                {t('pricing.currentFreePlan')}
              </Button>
              <FeatureList plan="essential" t={t} />
            </motion.div>

            {/* Pro — Most Popular */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              className="bg-card rounded-2xl border-2 border-primary p-7 flex flex-col relative cursor-pointer"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3 h-3" /> {t('pricing.mostPopular')}
              </div>
              <h3 className="font-heading text-xl font-bold mt-2">Pro</h3>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-4xl font-bold">$6.99</span>
                <span className="text-muted-foreground text-sm pb-1">{t('pricing.perMonth')}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{t('pricing.advancedAI')}</p>
              <Button
                className="w-full mb-4 bg-primary hover:bg-primary/90"
                onClick={() => openGumroad("https://noxuniverse.gumroad.com/l/skinguardpro")}
              >
                {t('pricing.subscribeGumroad')}
              </Button>
              <FeatureList plan="pro" t={t} />
            </motion.div>

            {/* Pro Plus */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              className="bg-card rounded-2xl border border-border/60 p-7 flex flex-col cursor-pointer"
            >
              <h3 className="font-heading text-xl font-bold mb-2">Pro Plus</h3>
              <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                <span className="font-heading text-4xl font-bold">$49</span>
                <span className="text-muted-foreground text-sm pb-1">{t('pricing.perYear')}</span>
                <span className="text-muted-foreground text-xs pb-1">($4.08/mo)</span>
              </div>
              <div className="mt-2 mb-6">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  {t('pricing.bestAnnualValue')} — {t('pricing.save41')}
                </span>
              </div>
              <Button
                className="w-full mb-4 bg-primary hover:bg-primary/90"
                onClick={() => openGumroad("https://noxuniverse.gumroad.com/l/skinguardproplus")}
              >
                {t('pricing.subscribeGumroad')}
              </Button>
              <FeatureList plan="proPlus" t={t} />
            </motion.div>

            {/* Lifetime */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              className="bg-gradient-to-b from-amber-50 to-card dark:from-amber-950/20 rounded-2xl border-2 border-amber-400 p-7 flex flex-col relative cursor-pointer"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <Zap className="w-3 h-3" /> {t('pricing.bestDeal')}
              </div>
              <h3 className="font-heading text-xl font-bold mt-2">Lifetime</h3>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-4xl font-bold">$69</span>
                <span className="text-muted-foreground text-sm pb-1">{t('pricing.oneTime')}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{t('pricing.payOnce')}</p>
              <Button
                className="w-full mb-4 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => openGumroad("https://noxuniverse.gumroad.com/l/skinguardailifetime")}
              >
                {t('pricing.getLifetimeAccess')}
              </Button>
              <FeatureList plan="lifetime" t={t} />
            </motion.div>

          </motion.div>
        )}

        {/* ── ANNUAL: Only Pro Plus + Lifetime ── */}
        {billingPeriod === "annual" && (
          <motion.div
            key="annual-grid"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.2 }}
            className="mb-16"
          >
            <p className="text-center text-muted-foreground text-sm mb-8">
              {t('pricing.bestLongTerm')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

              {/* Pro Plus — Annual highlight */}
              <motion.div
                whileHover={{ scale: 1.04, y: -8 }}
                transition={spring}
                className="bg-card rounded-2xl border-2 border-primary p-8 flex flex-col relative cursor-pointer"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {t('pricing.bestAnnualValue')}
                </div>
                <h3 className="font-heading text-2xl font-bold mt-2">Pro Plus</h3>
                <div className="flex items-end gap-2 mt-4 flex-wrap">
                  <span className="font-heading text-5xl font-bold">$49</span>
                  <div className="flex flex-col pb-1">
                    <span className="text-muted-foreground text-sm">{t('pricing.perYear')}</span>
                    <span className="text-muted-foreground text-xs">= $4.08/month</span>
                  </div>
                </div>
                <div className="mt-2 mb-6">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    {t('pricing.save41vsMonthly')}
                  </span>
                </div>
                <Button
                  className="w-full mb-6 bg-primary hover:bg-primary/90"
                  onClick={() => openGumroad("https://noxuniverse.gumroad.com/l/skinguardproplus")}
                >
                  {t('pricing.subscribeGumroad')}
                </Button>
                <FeatureList plan="proPlus" t={t} />
              </motion.div>

              {/* Lifetime — Annual highlight */}
              <motion.div
                whileHover={{ scale: 1.04, y: -8 }}
                transition={spring}
                className="bg-gradient-to-b from-amber-50 to-card dark:from-amber-950/20 rounded-2xl border-2 border-amber-400 p-8 flex flex-col relative cursor-pointer"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3 h-3" /> {t('pricing.payOnceOwn')}
                </div>
                <h3 className="font-heading text-2xl font-bold mt-2">Lifetime</h3>
                <div className="flex items-end gap-2 mt-4">
                  <span className="font-heading text-5xl font-bold">$69</span>
                  <span className="text-muted-foreground text-sm pb-1">{t('pricing.oneTime')}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  {t('pricing.noMonthlyAnnual')}
                </p>
                <Button
                  className="w-full mb-6 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => openGumroad("https://noxuniverse.gumroad.com/l/skinguardailifetime")}
                >
                  {t('pricing.getLifetimeAccess')}
                </Button>
                <FeatureList plan="lifetime" t={t} />
              </motion.div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── FAQ ── */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-heading text-2xl font-bold text-center mb-8">
          {t('pricing.faqTitle')}
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border/60 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-sm pr-4">{faq.q}</span>
                <HelpCircle
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    openFaq === i ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}