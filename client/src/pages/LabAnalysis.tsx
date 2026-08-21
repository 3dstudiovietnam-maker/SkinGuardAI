import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FlaskConical, ShieldAlert, FileText, Stethoscope, Loader2, Lock, Download, AlertTriangle, CheckCircle2, Clock, ListChecks, Home, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import ReportAiContent from "@/components/ReportAiContent";

// HealthGuard Lab Reader — portable, professional lab-report analysis page (i18n via lab.* keys).
// Renders a self-contained LIGHT "document" (works in dark mode + prints cleanly to PDF).
// Drop into any HealthGuardAI app: copy this page + the `analyzeLabReport`/`publicAnalyzeLabReport`
// procedures + buildLabReportPrompt in server/ai.ts, add a route + nav item + the `lab` i18n namespace.

interface LabTest {
  category?: string;
  name: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  status?: "low" | "normal" | "high" | "unknown";
}
interface LabFinding {
  title?: string;
  badge?: string;
  severity?: "info" | "mild" | "moderate" | "high";
  explanation?: string;
}
interface LabResult {
  analyzable?: boolean;
  reportInfo?: {
    patient?: string; reason?: string; sampleDate?: string;
    doctor?: string; facility?: string; panels?: string;
  };
  overview?: string;
  summary?: string; // back-compat
  tests?: LabTest[];
  referenceNotes?: string[];
  findings?: LabFinding[];
  reassuring?: string[];
  urgency?: { level?: string; text?: string };
  emergencyRedFlags?: string[];
  questionsForDoctor?: string[];
  furtherTests?: string[];
  homeActions?: { dos?: string[]; donts?: string[] };
  disclaimer?: string;
  remainingToday?: number;
}

const STATUS_STYLE: Record<string, string> = {
  high:    "bg-rose-100 text-rose-700",
  low:     "bg-amber-100 text-amber-700",
  normal:  "bg-emerald-100 text-emerald-700",
  unknown: "bg-slate-100 text-slate-600",
};
const SEVERITY_DOT: Record<string, string> = {
  high: "bg-rose-500", moderate: "bg-orange-500", mild: "bg-amber-500", info: "bg-sky-500",
};

export default function LabAnalysis() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  // Logged-in users hit the authenticated endpoint (premium = unlimited, no IP cap);
  // anonymous visitors use the IP-rate-limited public demo.
  const authedAnalyze = trpc.ai.analyzeLabReport.useMutation();
  const publicAnalyze = trpc.ai.publicAnalyzeLabReport.useMutation();
  const analyze = (user ? authedAnalyze : publicAnalyze) as typeof publicAnalyze;
  const fileRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<{ name: string; dataUrl: string; mimeType: string }[]>([]);
  const [error, setError] = useState<string>("");

  /**
   * The "Download PDF" button below is window.print(), and WKWebView on iOS does
   * not implement it — no print sheet, no PDF, no error. Inside the native shell
   * it is a button that visibly does nothing, which is precisely what Guideline
   * 2.1 rejections are written about. The report itself renders in full on screen
   * either way, so natively we simply do not offer the button.
   */
  const isNative =
    typeof window !== "undefined" &&
    !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor?.isNativePlatform?.();

  const result = analyze.data as LabResult | undefined;
  const statusLabel = (s?: string) =>
    s === "high" ? t('lab.statusHigh') : s === "low" ? t('lab.statusLow') :
    s === "normal" ? t('lab.statusNormal') : s ? t('lab.statusUnknown') : "—";

  // Add the selected files to the staging list (don't analyze yet) — so the user can
  // accumulate several files (separate panels / multi-page reports) before running.
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    if (e.target) e.target.value = ""; // let the user pick the same file again later
    if (!list.length) return;
    setError("");
    if (list.some((f) => f.size > 12 * 1024 * 1024)) { setError(t('lab.errorLarge')); return; }
    if (staged.length + list.length > 5) { setError(t('lab.errorTooMany')); return; }
    Promise.all(list.map((f) => new Promise<{ name: string; dataUrl: string; mimeType: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: f.name, dataUrl: reader.result as string, mimeType: f.type || "image/jpeg" });
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(f);
    }))).then((files) => setStaged((prev) => [...prev, ...files])).catch(() => setError(t('lab.errorAnalyze')));
  }

  function removeStaged(i: number) { setStaged((prev) => prev.filter((_, j) => j !== i)); }

  function runAnalysis() {
    if (!staged.length) return;
    setError("");
    analyze.mutate({ files: staged.map((s) => ({ fileBase64: s.dataUrl, mimeType: s.mimeType })), language });
  }

  // group tests by panel/category, preserving order
  const grouped: { cat: string; tests: LabTest[] }[] = [];
  if (Array.isArray(result?.tests)) {
    for (const tst of result!.tests!) {
      const cat = tst.category || "";
      let g = grouped.find((x) => x.cat === cat);
      if (!g) { g = { cat, tests: [] }; grouped.push(g); }
      g.tests.push(tst);
    }
  }
  const ri = result?.reportInfo;
  const riRows: [string, string | undefined][] = ri ? [
    [t('lab.patient'), ri.patient], [t('lab.reason'), ri.reason],
    [t('lab.sampleDate'), ri.sampleDate], [t('lab.doctor'), ri.doctor],
    [t('lab.facility'), ri.facility], [t('lab.panels'), ri.panels],
  ].filter(([, v]) => v && String(v).trim()) as [string, string][] : [];

  const overview = result?.overview || result?.summary;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-teal-50 dark:to-slate-800">
      {/* Print rules: only the document prints, in clean light colours */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .lab-print-area, .lab-print-area * { visibility: visible !important; }
          .lab-print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 14mm; }
        }
      `}</style>

      <div className="container max-w-3xl py-10">
        <div className="text-center mb-6 no-print">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-3">
            <FlaskConical className="w-7 h-7 text-teal-600 dark:text-teal-300" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('lab.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('lab.subtitle')}</p>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-300 mt-1">{t('lab.otherReports')}</p>
        </div>

        {/* Safety disclaimer — up front */}
        <div className="no-print bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-4 flex gap-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
            <strong>{t('lab.disclaimerStrong')}</strong> {t('lab.disclaimerBody')}
          </p>
        </div>

        <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" onChange={onFile} className="hidden" />

        {/* Staged files — added, not yet analyzed */}
        {staged.length > 0 && !analyze.isPending && (
          <div className="no-print mb-3 space-y-2">
            {staged.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-200 truncate flex-1">{f.name}</span>
                <button onClick={() => removeStaged(i)} className="text-slate-400 hover:text-rose-500 shrink-0" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add files (accumulate up to 5) */}
        {!analyze.isPending && staged.length < 5 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="no-print w-full border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-2xl p-6 text-center hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors"
          >
            <span className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-300">
              <Upload className="w-7 h-7 text-teal-600" />
              <span className="font-bold">{staged.length ? t('lab.addMore') : t('lab.uploadCta')}</span>
              <span className="text-xs text-slate-400">{t('lab.uploadHint')}</span>
            </span>
          </button>
        )}

        {/* Analyzing */}
        {analyze.isPending && (
          <div className="no-print w-full border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-2xl p-8 text-center">
            <span className="flex flex-col items-center justify-center gap-1 text-teal-700 dark:text-teal-300 font-bold">
              <Loader2 className="w-5 h-5 animate-spin" /> {t('lab.analyzing')}
              <span className="text-xs font-normal text-slate-400">{t('lab.analyzingHint')}</span>
            </span>
          </div>
        )}

        {/* Analyze button */}
        {staged.length > 0 && !analyze.isPending && (
          <button onClick={runAnalysis}
            className="no-print w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-sm">
            <FlaskConical className="w-5 h-5" /> {t('lab.analyzeCta')} · {staged.length}
          </button>
        )}

        <p className="no-print text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed flex items-start gap-1.5">
          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{t('lab.privacyNotice')}</span>
        </p>

        {error && <p className="no-print text-sm text-rose-600 mt-3 text-center">{error}</p>}
        {analyze.isError && <p className="no-print text-sm text-rose-600 mt-3 text-center">{t('lab.errorAnalyze')}</p>}

        {result && result.analyzable === false && (
          <div className="no-print mt-6 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-300">{result.overview || result.summary || t('lab.notReadable')}</p>
          </div>
        )}

        {result && result.analyzable !== false && (
          <>
            {/* Download/Print PDF — web only; window.print() is a no-op in WKWebView */}
            {!isNative && (
              <div className="no-print flex justify-end mt-6">
                <button onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors shadow-sm">
                  <Download className="w-4 h-4" /> {t('lab.downloadPdf')}
                </button>
              </div>
            )}

            {/* ── The printable LIGHT document ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="lab-print-area mt-4 bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">

              {/* Document header */}
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-black text-slate-900">{t('lab.reportTitle')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('lab.reportSubtitle')}</p>
              </div>

              {/* Patient / report info */}
              {riRows.length > 0 && (
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {riRows.map(([label, val], i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pr-4 font-semibold text-slate-500 align-top whitespace-nowrap w-1/3">{label}</td>
                        <td className="py-2 text-slate-800">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Educational warning */}
              <div className="lp-amber bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed"><strong>{t('lab.disclaimerStrong')}</strong> {t('lab.disclaimerBody')}</p>
              </div>

              {/* Overview */}
              {overview && (
                <section>
                  <h3 className="font-black text-slate-900 mb-2">{t('lab.overviewTitle')}</h3>
                  <p className="text-slate-700 leading-relaxed">{overview}</p>
                </section>
              )}

              {/* Results table, grouped by panel */}
              {grouped.length > 0 && (
                <section>
                  <h3 className="font-black text-slate-900 mb-2">{t('lab.resultsTitle')}</h3>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    {grouped.map((g, gi) => (
                      <div key={gi}>
                        {g.cat && <div className="bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600">{g.cat}</div>}
                        {g.tests.map((tst, i) => (
                          <div key={i} className="px-4 py-2.5 border-b border-slate-100 last:border-0 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800">{tst.name}</span>
                              <div className="text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">{tst.value} {tst.unit}</span>
                                {tst.referenceRange ? <span> · {tst.referenceRange}</span> : null}
                              </div>
                            </div>
                            <span className={`lp-badge text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${STATUS_STYLE[tst.status || "unknown"]}`}>
                              {statusLabel(tst.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {Array.isArray(result.referenceNotes) && result.referenceNotes.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.referenceNotes.map((n, i) => (
                        <li key={i} className="text-xs text-slate-500 leading-relaxed">* {n}</li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {/* Findings */}
              {Array.isArray(result.findings) && result.findings.length > 0 && (
                <section>
                  <h3 className="font-black text-slate-900 mb-2">{t('lab.findingsTitle')}</h3>
                  <div className="space-y-3">
                    {result.findings.map((f, i) => (
                      <div key={i} className="lp-card rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[f.severity || "info"]}`} />
                          <span className="font-bold text-slate-900">{f.title}</span>
                          {f.badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">{f.badge}</span>}
                        </div>
                        {f.explanation && <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{f.explanation}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reassuring */}
              {Array.isArray(result.reassuring) && result.reassuring.length > 0 && (
                <section className="lp-green bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {t('lab.reassuringTitle')}</h3>
                  <ul className="space-y-1.5">
                    {result.reassuring.map((r, i) => (
                      <li key={i} className="text-sm text-emerald-900 flex gap-2"><span>•</span><span>{r}</span></li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Urgency */}
              {result.urgency?.text && (
                <section className="lp-amber bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-bold text-amber-800 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" /> {t('lab.urgencyTitle')}{result.urgency.level ? ` — ${result.urgency.level}` : ""}</h3>
                  <p className="text-sm text-amber-900 leading-relaxed">{result.urgency.text}</p>
                </section>
              )}

              {/* Emergency red flags */}
              {Array.isArray(result.emergencyRedFlags) && result.emergencyRedFlags.length > 0 && (
                <section className="lp-rose bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <h3 className="font-bold text-rose-800 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {t('lab.redFlagsTitle')}</h3>
                  <ul className="space-y-1.5">
                    {result.emergencyRedFlags.map((r, i) => (
                      <li key={i} className="text-sm text-rose-900 flex gap-2"><span>•</span><span>{r}</span></li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Questions for doctor */}
              {Array.isArray(result.questionsForDoctor) && result.questionsForDoctor.length > 0 && (
                <section className="lp-teal bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-1.5"><Stethoscope className="w-4 h-4" /> {t('lab.questionsTitle')}</h3>
                  <ul className="space-y-1.5">
                    {result.questionsForDoctor.map((q, i) => (
                      <li key={i} className="text-sm text-teal-900 flex gap-2"><span>•</span><span>{q}</span></li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Further tests */}
              {Array.isArray(result.furtherTests) && result.furtherTests.length > 0 && (
                <section>
                  <h3 className="font-black text-slate-900 mb-2 flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-slate-500" /> {t('lab.furtherTitle')}</h3>
                  <ul className="space-y-1.5">
                    {result.furtherTests.map((x, i) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400">•</span><span>{x}</span></li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Home actions */}
              {(result.homeActions?.dos?.length || result.homeActions?.donts?.length) ? (
                <section>
                  <h3 className="font-black text-slate-900 mb-2 flex items-center gap-1.5"><Home className="w-4 h-4 text-slate-500" /> {t('lab.homeTitle')}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.homeActions?.dos?.length ? (
                      <div className="lp-green bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-emerald-700 uppercase mb-1.5">{t('lab.dosTitle')}</p>
                        <ul className="space-y-1">{result.homeActions.dos.map((d, i) => <li key={i} className="text-sm text-emerald-900 flex gap-2"><span>✓</span><span>{d}</span></li>)}</ul>
                      </div>
                    ) : null}
                    {result.homeActions?.donts?.length ? (
                      <div className="lp-rose bg-rose-50 border border-rose-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-rose-700 uppercase mb-1.5">{t('lab.dontsTitle')}</p>
                        <ul className="space-y-1">{result.homeActions.donts.map((d, i) => <li key={i} className="text-sm text-rose-900 flex gap-2"><span>✕</span><span>{d}</span></li>)}</ul>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {/* Disclaimer footer */}
              <p className="text-xs text-slate-400 border-t border-slate-200 pt-4 leading-relaxed">{result.disclaimer || t('lab.disclaimerBody')}</p>

              {/* Play's AI-Generated Content policy: flag a bad answer without
                  leaving the app. Only the summary text travels, never the
                  uploaded lab report itself. */}
              <div className="flex justify-center pt-1">
                <ReportAiContent
                  surface="lab-report"
                  content={[overview, result.urgency?.text].filter(Boolean).join("\n\n")}
                />
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
