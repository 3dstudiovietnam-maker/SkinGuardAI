/*
 * SkinGuard AI - Landing Page
 * Hero with generated illustration, features grid, CTA sections
 */
import { Link } from "wouter";
import { Camera, MapPin, GitCompareArrows, Bell, Shield, ArrowRight, CheckCircle, Facebook, FlaskConical, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";

const HERO_IMG = "/cdn/skinguard-hero-3d-dxG4qYePkYE5GXRkK2HRWb.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const }
  })
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Apple 3.1.1 — no pricing links inside the native (Capacitor) app
  const isNative = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium mb-6">
                <Shield className="w-3.5 h-3.5" />
                {t('hero.badge')}
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight text-slate-900 dark:text-slate-100 mb-5">
                {t('hero.title')}
              </h1>
              <div className="mb-5">
                <p className="text-2xl md:text-3xl text-cyan-600 font-semibold">{t('hero.accuracy')}</p>
                {/* The "+ Free Health Monitor" line that used to sit here has been
                    removed: it advertised the /test-monitor screen, which is no
                    longer part of the app (see App.tsx — fitness fork leftover with
                    seeded fake entries). The landing page must not promise a
                    feature the build does not contain (App Store 2.3.1). */}
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-lg">
                {t('hero.description')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                  <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 h-12 px-6 text-base text-white">
                    {t('hero.startMonitoring')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                {!isNative && (
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="h-12 px-6 text-base border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                      {t('hero.viewPlans')}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Lab & Report Analysis — surfaced in the hero because most users are on a
                  phone and would otherwise never find it inside the hamburger menu. */}
              <Link href="/lab-analysis" className="no-underline block mt-6">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-teal-200 dark:border-teal-700/60 bg-teal-50 dark:bg-teal-900/25 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors max-w-lg">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-teal-900 dark:text-teal-200 leading-tight">{t('lab.qaLabel')}</p>
                    <p className="text-xs text-teal-700 dark:text-teal-400 leading-snug mt-0.5">{t('lab.qaDesc')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                </div>
              </Link>

              <div className="flex items-center gap-6 mt-8 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-cyan-500" /> {t('hero.freeToStart')}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-cyan-500" /> {t('hero.noAccountNeeded')}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-cyan-500" /> {t('hero.privateSecure')}</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img src={HERO_IMG} alt="SkinGuard AI App" className="w-full h-auto" />
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <span className="text-cyan-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{t('hero.aiAccuracy')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('hero.aiAccuracyDesc')}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('home.healthyStatus')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facebook Group CTA Section */}
      <section className="bg-white dark:bg-slate-900 py-12 md:py-16">
        <div className="container">
          <div className="flex justify-center">
            <a
              href="https://www.facebook.com/share/g/1aSGhpR12p/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
            >
              <Facebook className="w-5 h-5" />
              <span>{t('home.joinFacebookGroup')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 dark:bg-slate-800 py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              {t('features.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { titleKey: 'features.smartCapture', descKey: 'features.smartCaptureDesc', icon: Camera },
              { titleKey: 'features.bodyMap', descKey: 'features.bodyMapDesc', icon: MapPin },
              { titleKey: 'features.comparison', descKey: 'features.comparisonDesc', icon: GitCompareArrows },
              { titleKey: 'features.reminders', descKey: 'features.remindersDesc', icon: Bell },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeUp}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t(feature.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABCDE Section */}
      <section className="container py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            {t('abcde.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            {t('abcde.subtitle')}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {[
            {
              letter: 'A', titleKey: 'abcde.asymmetry', descKey: 'abcde.asymmetryDesc',
              illustration: (
                <svg viewBox="0 0 80 60" className="w-full h-16" aria-hidden="true">
                  <ellipse cx="28" cy="30" rx="18" ry="18" fill="#06b6d4" opacity="0.3" />
                  <path d="M40,12 Q62,10 60,32 Q58,50 40,48 Z" fill="#f97316" opacity="0.35" />
                  <line x1="40" y1="8" x2="40" y2="52" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="14" y="55" fontSize="7" fill="#06b6d4" fontWeight="bold">A</text>
                  <text x="45" y="55" fontSize="7" fill="#f97316" fontWeight="bold">B</text>
                </svg>
              ),
            },
            {
              letter: 'B', titleKey: 'abcde.border', descKey: 'abcde.borderDesc',
              illustration: (
                <svg viewBox="0 0 80 60" aria-hidden="true" className="w-full h-16">
                  <circle cx="22" cy="30" r="14" fill="none" stroke="#22c55e" strokeWidth="2" />
                  <path d="M50,16 L55,22 L64,18 L60,28 L68,32 L60,36 L63,46 L54,42 L50,50 L46,42 L37,46 L40,36 L32,32 L40,28 L36,18 L45,22 Z" fill="none" stroke="#f97316" strokeWidth="1.8" />
                </svg>
              ),
            },
            {
              letter: 'C', titleKey: 'abcde.color', descKey: 'abcde.colorDesc',
              illustration: (
                <svg viewBox="0 0 80 60" aria-hidden="true" className="w-full h-16">
                  <defs>
                    <radialGradient id="colorGrad" cx="40%" cy="40%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="35%" stopColor="#7c3aed" />
                      <stop offset="65%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="40" cy="30" rx="24" ry="20" fill="url(#colorGrad)" />
                  <circle cx="18" cy="52" r="3" fill="#1e293b" />
                  <circle cx="28" cy="52" r="3" fill="#7c3aed" />
                  <circle cx="38" cy="52" r="3" fill="#dc2626" />
                  <circle cx="48" cy="52" r="3" fill="#d97706" />
                </svg>
              ),
            },
            {
              letter: 'D', titleKey: 'abcde.diameter', descKey: 'abcde.diameterDesc',
              illustration: (
                <svg viewBox="0 0 80 60" aria-hidden="true" className="w-full h-16">
                  <circle cx="22" cy="30" r="6" fill="#22c55e" opacity="0.7" />
                  <text x="16" y="46" fontSize="6" fill="#22c55e">small</text>
                  <circle cx="56" cy="30" r="16" fill="#f97316" opacity="0.5" />
                  <line x1="40" y1="14" x2="72" y2="14" stroke="#64748b" strokeWidth="1.2" />
                  <line x1="40" y1="11" x2="40" y2="17" stroke="#64748b" strokeWidth="1.2" />
                  <line x1="72" y1="11" x2="72" y2="17" stroke="#64748b" strokeWidth="1.2" />
                  <text x="47" y="12" fontSize="6" fill="#64748b">6 mm+</text>
                </svg>
              ),
            },
            {
              letter: 'E', titleKey: 'abcde.evolution', descKey: 'abcde.evolutionDesc',
              illustration: (
                <svg viewBox="0 0 80 60" aria-hidden="true" className="w-full h-16">
                  <circle cx="20" cy="34" r="7" fill="#06b6d4" opacity="0.5" />
                  <text x="13" y="50" fontSize="6" fill="#64748b">past</text>
                  <line x1="30" y1="30" x2="48" y2="28" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arr)" />
                  <defs>
                    <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
                    </marker>
                  </defs>
                  <circle cx="60" cy="28" r="13" fill="#f97316" opacity="0.55" />
                  <text x="50" y="50" fontSize="6" fill="#64748b">now</text>
                </svg>
              ),
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              className="bg-gradient-to-br from-cyan-50 dark:from-slate-900 to-blue-50 dark:to-slate-800 rounded-xl p-5 border border-cyan-200/60 text-center"
            >
              <div className="mb-3 px-2">{item.illustration}</div>
              <div className="w-10 h-10 rounded-full bg-cyan-500 text-white font-bold text-lg flex items-center justify-center mx-auto mb-2">
                {item.letter}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-sm">{t(item.titleKey)}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t(item.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Honesty Section — what SkinGuard AI is, and what it is not.
          Replaces the former testimonial block: the app has no verified user
          reviews, so no reviews, ratings or user counts are shown anywhere. */}
      <section className="bg-slate-50 dark:bg-slate-800 py-16 md:py-20">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium mb-6">
              {t('disclaimer.badge')}
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              {t('disclaimer.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              {t('disclaimer.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-amber-200 dark:border-amber-900/50 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                  {t('disclaimer.warning')}
                </p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {['disclaimer.bullet2', 'disclaimer.bullet3', 'disclaimer.bullet4'].map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-cyan-200 dark:border-cyan-900/50 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                  {t('disclaimer.bullet5')}
                </p>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>{t('hero.privateSecure')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>{t('hero.freeToStart')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                  <span>{t('hero.noAccountNeeded')}</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-center mt-8 max-w-2xl mx-auto"
          >
            {t('disclaimer.alwaysConsult')}
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-600 py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">{t('cta.title')}</h2>
          <p className="text-cyan-50 max-w-lg mx-auto mb-8 text-lg">{t('cta.subtitle')}</p>
          <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
            <Button size="lg" className="bg-white dark:bg-slate-900 text-cyan-600 hover:bg-cyan-50 h-12 px-8 text-base font-semibold">
              {t('cta.button')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}