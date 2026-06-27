/**
 * Legal Notice & Terms of Service
 * IP Protection, Copyright, Medical Disclaimer
 */

import { useLanguage } from "@/contexts/LanguageContext";

export default function Legal() {
  const { t } = useLanguage();

  const prohibited = [
    t('leg.prohibited1'), t('leg.prohibited2'), t('leg.prohibited3'), t('leg.prohibited4'),
    t('leg.prohibited5'), t('leg.prohibited6'), t('leg.prohibited7'),
  ];
  const medItems = [t('leg.med1'), t('leg.med2'), t('leg.med3'), t('leg.med4'), t('leg.med5')];
  const dataItems = [t('leg.data1'), t('leg.data2'), t('leg.data3'), t('leg.data4')];
  const liabItems = [t('leg.liab1'), t('leg.liab2'), t('leg.liab3'), t('leg.liab4'), t('leg.liab5')];
  const useItems = [t('leg.use1'), t('leg.use2'), t('leg.use3'), t('leg.use4'), t('leg.use5'), t('leg.use6')];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">{t('leg.title')}</h1>

        {/* Copyright & IP */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.ipTitle')}</h2>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
            <p className="text-slate-700 dark:text-slate-300">
              <strong>{t('leg.copyrightLabel')} &copy; {new Date().getFullYear()} SkinGuard AI</strong>
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <strong>{t('leg.ipOwnerLabel')}</strong> Attila Koch / Visa Line Inc.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <strong>{t('leg.addressLabel')}</strong> 16192 Coastal Highway, Lewes, Delaware 19958, USA
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              {t('leg.ipBody')}
            </p>
          </div>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.protectTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>
              {t('leg.protectIntro')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {prohibited.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </section>

        {/* Medical Disclaimer */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.medTitle')}</h2>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800/50 space-y-4">
            <p className="text-red-900 dark:text-red-300 font-semibold">
              {t('leg.medWarning')}
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              {t('leg.medIntro')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-700 dark:text-slate-300">
              {medItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="text-slate-700 dark:text-slate-300 font-semibold mt-4">
              {t('leg.medConsult')}
            </p>
          </div>
        </section>

        {/* Data Privacy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.dataTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>
              {t('leg.dataIntro')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {dataItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-4">
              {t('leg.dataNote')}
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.liabTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>
              {t('leg.liabIntro')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {liabItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <p className="mt-4">
              {t('leg.liabNote')}
            </p>
          </div>
        </section>

        {/* Acceptable Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.useTitle')}</h2>
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p>
              {t('leg.useIntro')}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {useItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('leg.contactTitle')}</h2>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-slate-700 dark:text-slate-300">
              <strong>{t('leg.contactIntro')}</strong>
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Visa Line Inc.<br />
              16192 Coastal Highway<br />
              Lewes, Delaware 19958, USA
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              {t('leg.contactLabel')} Attila Koch
            </p>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p>{t('leg.updatedLabel')} {new Date().toLocaleDateString()}</p>
          <p>{t('leg.subjectChange')}</p>
        </div>
      </div>
    </div>
  );
}
