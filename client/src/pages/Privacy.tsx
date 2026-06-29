/**
 * Privacy Policy — dedicated page (SkinGuard).
 * Built from the app's own, accurate, 11-language legal content (leg.* keys) so it
 * stays consistent with the combined /legal page. No fitness/other-app wording.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Privacy() {
  const { t } = useLanguage();
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const dataItems = [t('leg.data1'), t('leg.data2'), t('leg.data3'), t('leg.data4')];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        <Link href="/">
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary cursor-pointer mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('nav.home')}
          </span>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{t('footer.legal.privacy')}</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">{t('leg.updatedLabel')} {new Date().toLocaleDateString()}</p>

        {/* How your data is handled */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.dataTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>{t('leg.dataIntro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {dataItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-4">{t('leg.dataNote')}</p>
          </div>
        </section>

        {/* Health-data sensitivity */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.medTitle')}</h2>
          <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-lg border border-primary/20 space-y-4">
            <p className="text-slate-700 dark:text-slate-300">{t('leg.medIntro')}</p>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">{t('leg.medConsult')}</p>
          </div>
        </section>

        {/* Contact / data controller */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.contactTitle')}</h2>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-slate-700 dark:text-slate-300"><strong>{t('leg.contactIntro')}</strong></p>
            <p className="text-slate-700 dark:text-slate-300">
              Visa Line Inc.<br />
              16192 Coastal Highway<br />
              Lewes, Delaware 19958, USA
            </p>
            <p className="text-slate-700 dark:text-slate-300">{t('leg.contactLabel')} Attila Koch</p>
            <p className="text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700">
              <a href="mailto:privacy@skinguardai.app" className="text-primary hover:underline">privacy@skinguardai.app</a>
            </p>
          </div>
        </section>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p>{t('leg.subjectChange')}</p>
          <p className="mt-1">
            <Link href="/legal" className="text-primary hover:underline">{t('nav.legalNotice')}</Link>
            {" · "}
            <Link href="/terms" className="text-primary hover:underline">{t('footer.legal.terms')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
