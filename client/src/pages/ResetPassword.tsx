import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResetPassword() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const verifyToken = trpc.auth.verifyResetToken.useQuery({ token }, { enabled: false });
  const resetPassword = trpc.auth.resetPassword.useMutation();

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");
    if (resetToken) {
      setToken(resetToken);
      verifyToken.refetch();
    } else {
      setError(t('rp.noToken'));
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (verifyToken.isLoading) {
      setVerifying(true);
    } else if (verifyToken.isError) {
      setError(t('rp.invalidLink'));
      setVerifying(false);
    } else if (verifyToken.data) {
      setVerifying(false);
    }
  }, [verifyToken.isLoading, verifyToken.isError, verifyToken.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      await resetPassword.mutateAsync({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t('rp.failed'));
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">{t('rp.verifying')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{t('rp.invalidTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Link href="/forgot-password">
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                {t('rp.requestNew')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('rp.back')}
            </Button>
          </Link>
          <CardTitle className="text-2xl">{t('rp.title')}</CardTitle>
          <CardDescription>
            {success
              ? t('rp.successDesc')
              : t('rp.desc')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                {t('rp.successBody')}
              </p>
              <Link href="/login">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                  {t('rp.goToLogin')}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {t('rp.newPass')}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {t('rp.confirmPass')}
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-cyan-500 hover:bg-cyan-600"
              >
                {loading ? t('rp.resetting') : t('rp.resetBtn')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
