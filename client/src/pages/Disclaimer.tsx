import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ShieldAlert, Stethoscope } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Disclaimer() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link href="/">
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600 cursor-pointer mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('disclaimer.backToAnalysis')}
          </span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-600 bg-red-100 px-4 py-1.5 rounded-full mb-4">
            {t('disclaimer.badge')}
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            {t('disclaimer.title')}
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t('disclaimer.subtitle')}
          </p>
        </motion.div>

        {/* Main warning card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-900 font-bold text-base leading-relaxed">
              {t('disclaimer.warning')}
            </p>
          </div>
          <p className="text-slate-700 text-sm mb-4">{t('disclaimer.intro')}</p>
          <ul className="space-y-2.5 text-sm text-slate-700">
            {[
              t('disclaimer.bullet1'),
              t('disclaimer.bullet2'),
              t('disclaimer.bullet3'),
              t('disclaimer.bullet4'),
              t('disclaimer.bullet5'),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-red-200 text-red-700 text-xs font-bold flex-shrink-0 flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t border-red-200">
            <p className="text-slate-800 font-semibold text-sm leading-relaxed">
              {t('disclaimer.alwaysConsult')}
            </p>
          </div>
        </motion.div>

        {/* Limitation of Liability */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm"
        >
          <h2 className="font-heading text-xl font-bold text-slate-900 mb-4">
            {t('disclaimer.section2Title')}
          </h2>
          <p className="text-sm text-slate-600 mb-3">{t('disclaimer.section2Intro')}</p>
          <ul className="space-y-2 text-sm text-slate-700 mb-4">
            {[
              t('disclaimer.section2b1'),
              t('disclaimer.section2b2'),
              t('disclaimer.section2b3'),
              t('disclaimer.section2b4'),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-600 italic">{t('disclaimer.section2footer')}</p>
        </motion.div>

        {/* Seek Medical Attention */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope className="w-5 h-5 text-amber-600" />
            <h2 className="font-heading text-xl font-bold text-amber-900">
              {t('disclaimer.section3Title')}
            </h2>
          </div>
          <p className="text-sm text-amber-800 mb-3">{t('disclaimer.section3Intro')}</p>
          <ul className="space-y-2 text-sm text-amber-900">
            {[
              t('disclaimer.section3b1'),
              t('disclaimer.section3b2'),
              t('disclaimer.section3b3'),
              t('disclaimer.section3b4'),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">⚠</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-slate-600 mb-4">{t('disclaimer.ctaTitle')}</p>
          <Link href="/test/doctors">
            <span className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl cursor-pointer transition-colors">
              {t('disclaimer.ctaBtn')}
            </span>
          </Link>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-200">
          <p>{t('disclaimer.lastUpdated')}: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
