/**
 * In-app reporting control for AI-generated output.
 *
 * Google Play's AI-Generated Content policy is explicit that this is a
 * requirement, not a nicety: an app that generates content with AI "must
 * contain in-app user reporting or flagging features that allow users to report
 * or flag offensive content to developers without needing to exit the app".
 * Hence a dialog rather than a `mailto:` link — a mailto hands the user off to
 * the mail app, which is exactly the "exit the app" the policy rules out. It is
 * also why this is rendered next to every Gemini-produced answer in the app
 * (mole description, lab-report reader, AI chat, health report) instead of
 * being buried once in Settings.
 *
 * `content` should be the generated text the user is looking at, so the report
 * arrives with the actual wording to fix. Never pass a photo or a data URL:
 * the report goes to a mailbox, and a skin photo has no business there.
 */
import { useState } from "react";
import { Flag, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Surface =
  | "mole-analysis"
  | "lab-report"
  | "ai-chat"
  | "health-report"
  | "other";

type Reason = "offensive" | "harmful" | "inaccurate" | "irrelevant" | "other";

const REASONS: { value: Reason; key: string }[] = [
  { value: "offensive", key: "report.reasonOffensive" },
  { value: "harmful", key: "report.reasonHarmful" },
  { value: "inaccurate", key: "report.reasonInaccurate" },
  { value: "irrelevant", key: "report.reasonIrrelevant" },
  { value: "other", key: "report.reasonOther" },
];

export default function ReportAiContent({
  surface,
  content = "",
  className = "",
}: {
  surface: Surface;
  content?: string;
  className?: string;
}) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  const reportMutation = trpc.ai.reportContent.useMutation();

  const submit = async () => {
    if (!reason) return;
    try {
      await reportMutation.mutateAsync({
        surface,
        reason,
        details: details.slice(0, 2000),
        // Trim rather than reject: an over-long report is still a useful signal,
        // and silently failing the send would leave the user thinking it went.
        content: content.slice(0, 8000),
        language,
      });
      setSent(true);
    } catch {
      toast.error(t("report.error"));
    }
  };

  const close = () => {
    setOpen(false);
    // Reset only after the dialog's close animation, so the user does not watch
    // the confirmation flip back to the empty form on the way out.
    window.setTimeout(() => {
      setSent(false);
      setReason(null);
      setDetails("");
    }, 200);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline-offset-2 hover:underline transition-colors ${className}`}
        aria-label={t("report.button")}
      >
        <Flag className="w-3.5 h-3.5" />
        {t("report.button")}
      </button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent className="sm:max-w-md">
          {sent ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  {t("report.sentTitle")}
                </DialogTitle>
                <DialogDescription>{t("report.sentBody")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={close}>{t("report.close")}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t("report.title")}</DialogTitle>
                <DialogDescription>{t("report.subtitle")}</DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      reason === r.value
                        ? "border-primary bg-primary/10 text-slate-900 dark:text-slate-100"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t(r.key)}
                  </button>
                ))}
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder={t("report.detailsPlaceholder")}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <p className="text-xs text-muted-foreground">
                {t("report.privacyNote")}
              </p>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={close}>
                  {t("report.cancel")}
                </Button>
                <Button
                  onClick={submit}
                  disabled={!reason || reportMutation.isPending}
                >
                  {reportMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {t("report.submit")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
