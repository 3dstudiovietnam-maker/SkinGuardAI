import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = trpc.auth.requestPasswordReset.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestReset.mutateAsync({ email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || t('fp.failedMsg'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('fp.back')}
            </Button>
          </Link>
          <CardTitle className="text-2xl">{t('fp.title')}</CardTitle>
          <CardDescription>
            {submitted
              ? t('fp.successDesc')
              : t('fp.desc')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-cyan-600" />
                </div>
              </div>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                {t('fp.sentTo')} <strong>{email}</strong>
              </p>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                {t('fp.expiry')}
              </p>
              <Link href="/login">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                  {t('fp.returnLogin')}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('fp.emailLabel')}
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-slate-300"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-cyan-500 hover:bg-cyan-600"
              >
                {loading ? t('fp.sending') : t('fp.sendBtn')}
              </Button>

              <div className="text-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">{t('fp.noAccount')}</span>
                <Link href="/signup">
                  <a className="text-cyan-600 hover:text-cyan-700 font-medium">{t('fp.signUp')}</a>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
