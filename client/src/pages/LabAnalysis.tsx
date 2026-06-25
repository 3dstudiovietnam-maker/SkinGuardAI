import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FlaskConical, ShieldAlert, FileText, Stethoscope, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

// HealthGuard Lab Reader — portable lab-report analysis page (i18n via lab.* keys).
// Drop into any HealthGuardAI app: copy this page + the self-contained
// `publicAnalyzeLabReport` procedure in server/ai.ts, add a route + nav item,
// and add the `lab` i18n namespace to translations.ts.

interface LabTest {
  name: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  status?: "low" | "normal" | "high" | "unknown";
  explanation?: string;
}
interface LabResult {
  analyzable?: boolean;
  summary?: string;
  tests?: LabTest[];
  flagged?: string[];
  questionsForDoctor?: string[];
  disclaimer?: string;
  remainingToday?: number;
}

const STATUS_STYLE: Record<string, string> = {
  high:    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  low:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  normal:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  unknown: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export default function LabAnalysis() {
  const { language, t } = useLanguage();
  const analyze = trpc.ai.publicAnalyzeLabReport.useMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const result = analyze.data as LabResult | undefined;
  const statusLabel = (s?: string) =>
    s === "high" ? t('lab.statusHigh') : s === "low" ? t('lab.statusLow') :
    s === "normal" ? t('lab.statusNormal') : s ? t('lab.statusUnknown') : "—";

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (file.size > 12 * 1024 * 1024) { setError(t('lab.errorLarge')); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      analyze.mutate({ fileBase64: dataUrl, mimeType: file.type || "image/jpeg", language });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-2xl py-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-3">
            <FlaskConical className="w-7 h-7 text-teal-600 dark:text-teal-300" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('lab.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('lab.subtitle')}</p>
        </div>

        {/* Safety disclaimer — shown UP FRONT, always */}
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-4 flex gap-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
            <strong>{t('lab.disclaimerStrong')}</strong> {t('lab.disclaimerBody')}
          </p>
        </div>

        <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={analyze.isPending}
          className="w-full border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-2xl p-8 text-center hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors disabled:opacity-60"
        >
          {analyze.isPending ? (
            <span className="flex items-center justify-center gap-2 text-teal-700 dark:text-teal-300 font-bold">
              <Loader2 className="w-5 h-5 animate-spin" /> {t('lab.analyzing')}
            </span>
          ) : (
            <span className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-300">
              <Upload className="w-7 h-7 text-teal-600" />
              <span className="font-bold">{fileName ? t('lab.uploadAnother') : t('lab.uploadCta')}</span>
              <span className="text-xs text-slate-400">{t('lab.uploadHint')}</span>
            </span>
          )}
        </button>

        {error && <p className="text-sm text-rose-600 mt-3 text-center">{error}</p>}
        {analyze.isError && <p className="text-sm text-rose-600 mt-3 text-center">{t('lab.errorAnalyze')}</p>}
        {fileName && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-4 h-4" /> {fileName}
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
            {result.analyzable === false ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300">{result.summary || t('lab.notReadable')}</p>
              </div>
            ) : (
              <>
                {result.summary && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide mb-1">{t('lab.summary')}</p>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{result.summary}</p>
                  </div>
                )}

                {Array.isArray(result.tests) && result.tests.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {result.tests.map((tst, i) => (
                      <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">{tst.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_STYLE[tst.status || "unknown"]}`}>
                            {statusLabel(tst.status)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-semibold">{tst.value} {tst.unit}</span>
                          {tst.referenceRange ? <span className="text-slate-400"> · {tst.referenceRange}</span> : null}
                        </div>
                        {tst.explanation && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{tst.explanation}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(result.questionsForDoctor) && result.questionsForDoctor.length > 0 && (
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-5 border border-teal-100 dark:border-teal-800/50">
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" /> {t('lab.questionsTitle')}
                    </p>
                    <ul className="space-y-1.5">
                      {result.questionsForDoctor.map((q, i) => (
                        <li key={i} className="text-sm text-teal-800 dark:text-teal-200 flex gap-2"><span>•</span><span>{q}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.disclaimer && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center px-4">{result.disclaimer}</p>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
