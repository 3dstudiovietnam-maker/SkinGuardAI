/**
 * Prominent disclosure + affirmative consent, shown BEFORE the camera or the
 * photo picker is opened.
 *
 * Google Play treats camera access and photos as personal and sensitive user
 * data, which means the disclosure has to be in the app itself (not only in the
 * store listing or the privacy policy), has to appear in the normal course of
 * use rather than hidden in a menu, has to say which data we access, what we do
 * with it and who else receives it, and has to come BEFORE the runtime
 * permission dialog. It also may not be a toast or an auto-dismissing popup,
 * and navigating away must not count as agreement — so this is a modal with two
 * explicit buttons and no "click outside to accept" path.
 *
 * `getUserMedia()` triggers Android's permission prompt the moment it is called,
 * so the disclosure cannot live inside the capture flow: the caller must await
 * this gate first. `useCaptureConsent()` returns that gate.
 *
 * The gallery path is gated too. It needs no Android permission (the system
 * photo picker grants access to the one chosen file), but the sensitive part is
 * not the picking — it is that the picked photo of the user's skin is uploaded
 * and sent to a third-party AI provider. That is what has to be disclosed, and
 * it is equally true whichever way the image arrives.
 */
import { useCallback, useRef, useState } from "react";
import { Camera, ShieldCheck } from "lucide-react";
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

const CONSENT_KEY = "skinguard.captureConsent.v1";

function hasStoredConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    // Private mode / storage disabled: fall back to asking every time. Asking
    // twice is a small annoyance; skipping the disclosure is a policy breach.
    return false;
  }
}

function storeConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, "granted");
  } catch {
    /* nothing to do — see hasStoredConsent() */
  }
}

/**
 * Gate a camera/gallery action behind the disclosure.
 *
 * Usage:
 *   const { requestConsent, disclosure } = useCaptureConsent();
 *   <button onClick={() => requestConsent(() => startCamera())}>…</button>
 *   {disclosure}
 *
 * The action runs immediately once consent has been given before, and otherwise
 * only after the user presses Continue.
 */
export function useCaptureConsent() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const requestConsent = useCallback((action: () => void) => {
    if (hasStoredConsent()) {
      action();
      return;
    }
    pendingAction.current = action;
    setOpen(true);
  }, []);

  const accept = () => {
    storeConsent();
    setOpen(false);
    const action = pendingAction.current;
    pendingAction.current = null;
    // Let the dialog finish closing before the OS permission sheet appears, so
    // the two never fight over the screen.
    window.setTimeout(() => action?.(), 150);
  };

  const decline = () => {
    pendingAction.current = null;
    setOpen(false);
  };

  const disclosure = (
    <Dialog
      open={open}
      // Only the two buttons decide. Dismissing by backdrop or Esc counts as
      // declining, never as consent.
      onOpenChange={(o) => {
        if (!o) decline();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>{t("captureConsent.title")}</DialogTitle>
          <DialogDescription>{t("captureConsent.intro")}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          {[
            "captureConsent.point1",
            "captureConsent.point2",
            "captureConsent.point3",
            "captureConsent.point4",
          ].map((key) => (
            <li key={key} className="flex gap-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          {t("captureConsent.footer")}
        </p>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={decline}>
            {t("captureConsent.decline")}
          </Button>
          <Button onClick={accept}>{t("captureConsent.accept")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { requestConsent, disclosure };
}
