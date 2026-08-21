/**
 * Public account-deletion page — https://www.skinguardai.app/delete-account
 *
 * This URL is what goes in the Play Console's Data safety form. Google requires
 * BOTH an in-app deletion path (we have it: Dashboard → Delete account) AND a
 * public web route, on the reasoning that someone who has already uninstalled
 * the app has no in-app path left to use. The page therefore has to work with
 * no session and no app installed, which is why the request form below asks
 * only for an e-mail address.
 *
 * Play also requires the page to name the app as it appears on the store
 * listing, to put deletion prominently rather than buried, and to state plainly
 * what is erased and what (if anything) is retained. All three are load-bearing
 * — a page that merely links to the privacy policy fails review.
 *
 * Not linked from the native app's own navigation, on purpose: in the app the
 * real deletion button is one tap away in the dashboard, and sending a
 * signed-in user out to a web form to ask for something they can just do would
 * be worse, not better.
 */
import { useState } from "react";
import { Link } from "wouter";
import { Trash2, ShieldCheck, Mail, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DeleteAccount() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const requestMutation = trpc.auth.requestAccountDeletion.useMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await requestMutation.mutateAsync({ email: email.trim(), note: note.slice(0, 1000) });
      setSent(true);
    } catch {
      toast.error(t("deleteAccount.error"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("nav.home")}
          </span>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("deleteAccount.title")}
          </h1>
        </div>

        {/* Naming the app and the developer exactly as they appear on the store
            listing is a Play requirement for this page, not decoration. */}
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {t("deleteAccount.appLine")}
        </p>

        {/* Route 1 — instant, in the app or on the web, for anyone who can log in */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {t("deleteAccount.option1Title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {t("deleteAccount.option1Body")}
          </p>
          <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-4 list-decimal list-inside">
            <li>{t("deleteAccount.step1")}</li>
            <li>{t("deleteAccount.step2")}</li>
            <li>{t("deleteAccount.step3")}</li>
          </ol>
          <Link href="/user-dashboard">
            <Button variant="outline">{t("deleteAccount.goToDashboard")}</Button>
          </Link>
        </section>

        {/* Route 2 — for the person who has already uninstalled, or cannot log in */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {t("deleteAccount.option2Title")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {t("deleteAccount.option2Body")}
          </p>

          {sent ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-xl">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">
                {t("deleteAccount.sent")}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("deleteAccount.emailPlaceholder")}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder={t("deleteAccount.notePlaceholder")}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" disabled={requestMutation.isPending}>
                {requestMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t("deleteAccount.submit")}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4 flex items-start gap-2">
            <Mail className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {t("deleteAccount.emailFallback")}
          </p>
        </section>

        {/* What actually goes, and what stays — stating this is required, and it
            is also what stops the page from being a promise we cannot keep. */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t("deleteAccount.whatTitle")}
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-4">
            {["deleted1", "deleted2", "deleted3", "deleted4"].map((k) => (
              <li key={k} className="flex gap-2">
                <Trash2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{t(`deleteAccount.${k}`)}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("deleteAccount.retention")}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t("deleteAccount.timing")}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
            <Link href="/privacy" className="text-primary hover:underline">
              {t("footer.legal.privacy")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
