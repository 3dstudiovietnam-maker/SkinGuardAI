import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Sun, Shield, Eye, TrendingUp, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ABCDE_ITEMS = [
  { letter: "A", color: "bg-red-100 text-red-700 border-red-200", titleKey: "test.abcdA", descKey: "test.abcdADesc" },
  { letter: "B", color: "bg-orange-100 text-orange-700 border-orange-200", titleKey: "test.abcdB", descKey: "test.abcdBDesc" },
  { letter: "C", color: "bg-amber-100 text-amber-700 border-amber-200", titleKey: "test.abcdC", descKey: "test.abcdCDesc" },
  { letter: "D", color: "bg-violet-100 text-violet-700 border-violet-200", titleKey: "test.abcdD", descKey: "test.abcdDDesc" },
  { letter: "E", color: "bg-cyan-100 text-cyan-700 border-cyan-200", titleKey: "test.abcdE", descKey: "test.abcdEDesc" },
];

const RISK_ITEMS = [
  { iconKey: "☀️", textKey: "test.riskFair" },
  { iconKey: "🔥", textKey: "test.riskSunburn" },
  { iconKey: "🧬", textKey: "test.riskFamily" },
  { iconKey: "🔵", textKey: "test.riskMoles" },
  { iconKey: "🏭", textKey: "test.riskUV" },
];

const PREVENTION_ITEMS = [
  { icon: <Sun className="w-5 h-5" />, textKey: "test.prevSunscreen" },
  { icon: <Shield className="w-5 h-5" />, textKey: "test.prevClothing" },
  { icon: <Eye className="w-5 h-5" />, textKey: "test.prevExam" },
  { icon: <Activity className="w-5 h-5" />, textKey: "test.prevDermatologist" },
];

const STATS = [
  { statKey: "test.stat1", color: "bg-green-50 border-green-200 text-green-700" },
  { statKey: "test.stat2", color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  { statKey: "test.stat3", color: "bg-violet-50 border-violet-200 text-violet-700" },
];

export default function TestKnowledge() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 dark:from-slate-900 to-white dark:to-slate-900">
      {/* Sub-nav */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { href: "/test", label: t("test.navTest") },
            { href: "/test/knowledge", label: t("test.navKnowledge") },
            { href: "/test/doctors", label: t("test.navDoctors") },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="inline-block px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 whitespace-nowrap border-b-2 border-transparent hover:border-cyan-500 transition-colors cursor-pointer">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/test">
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 cursor-pointer mb-6">
            <ChevronLeft className="w-4 h-4" />
            {t("test.backToTest")}
          </span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-4xl text-center mb-3">📚</div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
            {t("test.knowledgeBase")}
          </h1>
        </motion.div>

        {/* What is a mole */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 mb-8"
        >
          <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span className="text-2xl">🔵</span> {t("test.moleWhat")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{t("test.moleDesc")}</p>
        </motion.section>

        {/* ABCDE */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
            <span className="text-2xl">🔬</span> {t("test.abcdTitle")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t("test.abcdSubtitle")}</p>

          <div className="space-y-3">
            {ABCDE_ITEMS.map((item, i) => (
              <motion.div
                key={item.letter}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className={`flex gap-4 p-4 rounded-2xl border ${item.color}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading text-xl font-extrabold shrink-0 border ${item.color}`}>
                  {item.letter}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t(item.titleKey)}</p>
                  <p className="text-xs mt-0.5 opacity-80">{t(item.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Risk factors */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> {t("test.riskFactors")}
          </h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
            {RISK_ITEMS.map((item) => (
              <div key={item.textKey} className="flex items-start gap-3 p-4">
                <span className="text-xl">{item.iconKey}</span>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t(item.textKey)}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Prevention */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-2xl">🛡️</span> {t("test.prevention")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PREVENTION_ITEMS.map((item) => (
              <div key={item.textKey} className="flex items-start gap-3 p-4 bg-cyan-50 border border-cyan-100 rounded-xl">
                <span className="text-cyan-600 shrink-0 mt-0.5">{item.icon}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{t(item.textKey)}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Statistics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-600" /> {t("test.statistics")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STATS.map((stat) => (
              <div key={stat.statKey} className={`p-4 rounded-2xl border text-center font-medium text-sm ${stat.color}`}>
                {t(stat.statKey)}
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 border-t border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t("test.tryApp")}</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/test">
              <span className="inline-block px-5 py-2.5 border border-slate-300 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm cursor-pointer transition-colors">
                {t("test.backToTest")}
              </span>
            </Link>
            <Link href="/signup">
              <span className="inline-block px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl text-sm cursor-pointer transition-colors">
                {t("test.registerNow")} →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
