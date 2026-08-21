import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle as Check, XCircle, Mail as MailIcon } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmail() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const ranRef = useRef(false);

  const verifyEmail = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage(t('ve.noToken') || "No verification token found in the link.");
      return;
    }

    verifyEmail.mutateAsync({ token })
      .then(() => setStatus("success"))
      .catch((err: any) => {
        setStatus("error");
        setMessage(err?.message || (t('ve.failed') || "Verification failed."));
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            {status === "verifying" && (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <MailIcon className="w-8 h-8 text-green-600 animate-pulse" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "verifying" && (t('ve.verifyingTitle') || "Verifying your email…")}
            {status === "success" && (t('ve.successTitle') || "Email verified!")}
            {status === "error" && (t('ve.errorTitle') || "Verification failed")}
          </CardTitle>
          <CardDescription>
            {status === "verifying" && (t('ve.verifyingDesc') || "Please wait a moment.")}
            {status === "success" && (t('ve.successDesc') || "Your email address has been confirmed. You're all set!")}
            {status === "error" && (message || (t('ve.errorDesc') || "This link may be invalid or expired."))}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {status === "verifying" && (
            <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto" />
          )}
          {status === "success" && (
            <Link href="/dashboard">
              <Button className="w-full bg-primary hover:bg-primary">{t('ve.goToDashboard') || "Go to Dashboard"}</Button>
            </Link>
          )}
          {status === "error" && (
            <>
              <Link href="/login">
                <Button className="w-full bg-primary hover:bg-primary">{t('ve.goToLogin') || "Go to Login"}</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">{t('ve.goHome') || "Back to Home"}</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
