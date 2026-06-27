import { Link } from "wouter";
import { motion } from "framer-motion";
import { Camera, BookOpen, Stethoscope, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import RandomImageTest from "@/components/RandomImageTest";

export default function TestPage() {
  const { t } = useLanguage();

  const navItems = [
    { href: "/test", label: t("test.navTest") },
    { href: "/test/knowledge", label: t("test.navKnowledge") },
    { href: "/test/doctors", label: t("test.navDoctors") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 dark:from-slate-900 to-white dark:to-slate-900">
      {/* Sub-navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="inline-block px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-600 whitespace-nowrap border-b-2 border-transparent hover:border-cyan-500 transition-colors cursor-pointer">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-3">👁️</div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("test.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t("test.subtitle")}</p>
        </motion.div>

        {/* Random image test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">
            {t("test.randomImageTest")}
          </h2>
          <RandomImageTest />
        </motion.div>

        {/* CTA cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {/* Own photo */}
          <Link href="/test/capture">
            <div className="p-5 bg-cyan-50 border border-cyan-200 rounded-2xl hover:bg-cyan-100 transition-colors cursor-pointer group">
              <Camera className="w-8 h-8 text-cyan-600 mb-3" />
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{t("test.tryOwnPhoto")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("test.uploadPhoto")}</p>
              <ChevronRight className="w-4 h-4 text-cyan-500 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Knowledge base */}
          <Link href="/test/knowledge">
            <div className="p-5 bg-violet-50 border border-violet-200 rounded-2xl hover:bg-violet-100 transition-colors cursor-pointer group">
              <BookOpen className="w-8 h-8 text-violet-600 mb-3" />
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{t("test.knowledgeBase")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("test.abcdTitle")}</p>
              <ChevronRight className="w-4 h-4 text-violet-500 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Doctors */}
          <Link href="/test/doctors">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-colors cursor-pointer group">
              <Stethoscope className="w-8 h-8 text-emerald-600 mb-3" />
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{t("test.doctorsNearby")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("test.findDoctors")}</p>
              <ChevronRight className="w-4 h-4 text-emerald-500 mt-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </motion.div>

        {/* Sign up CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-6 border-t border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{t("test.tryApp")}</p>
          <Link href="/signup">
            <span className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl cursor-pointer transition-colors">
              {t("test.registerNow")} →
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
