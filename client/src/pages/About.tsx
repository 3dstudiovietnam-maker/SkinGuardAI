import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Users, AlertCircle, CheckCircle, Heart } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white dark:from-slate-900 to-slate-50 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-cyan-50 dark:via-slate-900 to-white dark:to-slate-900 py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              SkinGuard AI
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-16 space-y-16">

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold">{t('about.missionTitle')}</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
            {t('about.missionText')}
          </p>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold">{t('about.howItWorksTitle')}</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
            {t('about.howItWorksText')}
          </p>
        </motion.section>

        {/* Why It Matters — Stats */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold">{t('about.whyMattersTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { text: t('about.stat1'), color: "border-green-200 bg-green-50", icon: CheckCircle, iconColor: "text-green-600" },
              { text: t('about.stat2'), color: "border-amber-200 bg-amber-50", icon: AlertCircle, iconColor: "text-amber-600" },
              { text: t('about.stat3'), color: "border-primary/20 bg-primary/5", icon: TrendingUp, iconColor: "text-primary" },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${stat.color}`}>
                <stat.icon className={`w-6 h-6 mb-3 ${stat.iconColor}`} />
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{stat.text}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Medical Disclaimer */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <h2 className="font-heading text-xl font-bold text-slate-700 dark:text-slate-300">{t('about.disclaimerTitle')}</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('about.disclaimerText')}
          </p>
        </motion.section>

        {/* Team */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold">{t('about.teamTitle')}</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
            {t('about.teamText')}
          </p>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center bg-gradient-to-br from-primary/10 to-cyan-50 dark:to-slate-800 rounded-3xl p-12"
        >
          <h2 className="font-heading text-3xl font-bold mb-3">{t('about.ctaTitle')}</h2>
          <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
            {t('about.ctaText')}
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              {t('about.ctaBtn')}
            </Button>
          </Link>
        </motion.section>

      </div>
    </div>
  );
}
