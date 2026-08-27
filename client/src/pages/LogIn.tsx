import { lazy, Suspense, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Lock, AlertCircle, CheckCircle, Chrome, Gift, Shield, Star, Zap, Check, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthLanguageSelector } from "@/components/LanguageSelector";
import { useSkinStore } from "@/contexts/SkinStore"; // <-- IMPORTÁLNI KELL!

const getOAuthRedirectUri = () => window.location.origin;

// The post-login plan chooser is a paywall, so the native build must not carry
// it at all (Apple 2.3.1 — no hidden, dormant features). __NATIVE_BUILD__ is a
// compile-time literal: in the native build this ternary folds to null and the
// bundler drops both the dynamic import and the whole PlanSelection chunk.
const PlanSelection = __NATIVE_BUILD__ ? null : lazy(() => import("./PlanSelection"));


export default function LogIn() {
  const { t } = useLanguage();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [planPromoError, setPlanPromoError] = useState("");
  const [planPromoLoading, setPlanPromoLoading] = useState(false);

  // Promo code — pre-fill from localStorage if signup stored one
  const pendingPromo = typeof window !== "undefined" ? (localStorage.getItem("skinguard_pending_promo") ?? "") : "";
  const [promoCode, setPromoCode] = useState(pendingPromo);
  const [showPromoField, setShowPromoField] = useState(!!pendingPromo);

  const loginMutation = trpc.auth.loginEmail.useMutation();
  const redeemMutation = trpc.auth.redeemPromoCode.useMutation();
  
  // <-- SKINSTORE HASZNÁLATA
  const { login } = useSkinStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.email.includes("@")) {
      setError(t("auth.invalidEmail") || "Email invalid");
      return false;
    }
    if (formData.password.length < 8) {
      setError(t("auth.passwordTooShort") || "Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // <-- ITT A LÉNYEGES MÓDOSÍTÁS: user ID és name átadása a SkinStore login-nak!
      login(formData.email, result.userId); 

      setSuccess(true);

      // If a promo code was entered, try to redeem it right after login (user is now authenticated)
      if (promoCode.trim()) {
        try {
          await redeemMutation.mutateAsync({ code: promoCode.trim() });
          localStorage.removeItem("skinguard_pending_promo");
          // Promo code valid → go to dashboard as upgraded
          setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
          return;
        } catch {
          // Invalid or wrong-email code — clear localStorage, continue normal flow
          localStorage.removeItem("skinguard_pending_promo");
        }
      }

      // If user is on Essential plan, show plan selection (web only — native skips
      // straight to the dashboard on the free path, Apple 3.1.1)
      if (result.plan === "essential" && !__NATIVE_BUILD__) {
        setShowPlanSelection(true);
      } else {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || t("auth.invalidCredentials") || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Plan Selection Screen ─────────────────────────────────────────────────
  // Web only. The plan cards live in their own module so that the native build
  // (Apple 2.3.1) never contains their price strings or checkout links — the
  // import at the top of this file is dead code once __NATIVE_BUILD__ folds.
  if (showPlanSelection && PlanSelection) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
        <PlanSelection />
      </Suspense>
    );
  }

  // ── Login Form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Language Selector — top right */}
        <div className="flex justify-end mb-4">
          <AuthLanguageSelector />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("auth.welcomeBack")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          {/* Social Login Buttons */}
          {/* Compiled out of the native build rather than hidden with display:none,
              so no dormant control ships (Apple 2.3.1). */}
          {!__NATIVE_BUILD__ && (
          <div className="mb-6 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">{t("auth.signInWith")}</p>
            <button
              type="button"
              onClick={() => {
                if (!googleClientId) {
                  setError("Google configuration not loaded. Please refresh the page.");
                  return;
                }
                const scope = "openid profile email";
                const responseType = "code";
                const redirectUri = `${getOAuthRedirectUri()}/auth/google/callback`;
                const state = Math.random().toString(36).substring(7);
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${state}`;
                window.location.href = authUrl;
              }}
              className="w-full py-2 border border-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Chrome className="w-4 h-4" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">{t("auth.orEmail")}</span>
              </div>
            </div>
          </div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{t("auth.loggedIn")}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("auth.emailLabel")}
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("auth.passwordLabel")}
                </div>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pr-11 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-cyan-600 hover:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg"
            >
              {isLoading ? t("auth.signingIn") : t("auth.signInBtn")}
            </Button>
          </form>

          {/* "Nincs még fiókja? Regisztráljon itt" - közvetlenül a submit után */}
          <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">
              {t("auth.noAccount")}{" "}
              <Link href="/signup" className="text-cyan-600 hover:underline font-medium">
                {t("auth.createHere")}
              </Link>
            </p>
          </div>

          {/* Promo Code - nagyobb gomb, közvetlenül a "Nincs még fiókja?" alatt */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowPromoField(v => !v)}
              className="w-full py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-800 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              <span>{showPromoField ? t("auth.promoHide") : t("auth.promoShow")}</span>
            </button>
            {showPromoField && (
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t("auth.promoCodePlaceholder") || "pl. SGPARTNER2025"}
                className="mt-3 w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm uppercase tracking-wider bg-amber-50"
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}