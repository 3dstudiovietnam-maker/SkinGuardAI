/**
 * Terms of Service — dedicated page (SkinGuard).
 * Built from the app's own, accurate, 11-language legal content (leg.* keys).
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Terms() {
  const { t } = useLanguage();
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const useItems = [t('leg.use1'), t('leg.use2'), t('leg.use3'), t('leg.use4'), t('leg.use5'), t('leg.use6')];
  const prohibited = [
    t('leg.prohibited1'), t('leg.prohibited2'), t('leg.prohibited3'), t('leg.prohibited4'),
    t('leg.prohibited5'), t('leg.prohibited6'), t('leg.prohibited7'),
  ];
  const medItems = [t('leg.med1'), t('leg.med2'), t('leg.med3'), t('leg.med4'), t('leg.med5')];
  const liabItems = [t('leg.liab1'), t('leg.liab2'), t('leg.liab3'), t('leg.liab4'), t('leg.liab5')];

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
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{t('footer.legal.terms')}</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">{t('leg.updatedLabel')} {new Date().toLocaleDateString()}</p>

        {/* Medical disclaimer — front and centre */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.medTitle')}</h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800/50 space-y-4">
            <p className="text-red-900 dark:text-red-300 font-semibold flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> {t('leg.medWarning')}
            </p>
            <p className="text-slate-700 dark:text-slate-300">{t('leg.medIntro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-700 dark:text-slate-300">
              {medItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">{t('leg.medConsult')}</p>
          </div>
        </section>

        {/* Acceptable use */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.useTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>{t('leg.useIntro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {useItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </section>

        {/* Prohibited activities */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.protectTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>{t('leg.protectIntro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {prohibited.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </section>

        {/* Limitation of liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.liabTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>{t('leg.liabIntro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {liabItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-4">{t('leg.liabNote')}</p>
          </div>
        </section>

        {/* Intellectual property */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.ipTitle')}</h2>
          <div className="space-y-2 text-slate-700 dark:text-slate-300">
            <p><strong>{t('leg.copyrightLabel')} &copy; {new Date().getFullYear()} SkinGuard AI</strong></p>
            <p>{t('leg.ipBody')}</p>
          </div>
        </section>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p>{t('leg.subjectChange')}</p>
          <p className="mt-1">
            <Link href="/legal" className="text-primary hover:underline">{t('nav.legalNotice')}</Link>
            {" · "}
            <Link href="/privacy" className="text-primary hover:underline">{t('footer.legal.privacy')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
