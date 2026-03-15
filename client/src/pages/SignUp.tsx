import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, AlertCircle, CheckCircle, Chrome, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthLanguageSelector } from "@/components/LanguageSelector";

const getOAuthRedirectUri = () => window.location.origin;

// SPRING definiálva
const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

export default function SignUp() {
  const { t } = useLanguage();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [showPromoField, setShowPromoField] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signupMutation = trpc.auth.signupEmail.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t("auth.nameRequired") || "A név megadása kötelező");
      return false;
    }
    if (formData.name.length < 2) {
      setError(t("auth.nameTooShort") || "A név legalább 2 karakter legyen");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError(t("auth.invalidEmail") || "Érvénytelen e-mail cím");
      return false;
    }
    if (formData.password.length < 8) {
      setError(t("auth.passwordTooShort") || "A jelszó legalább 8 karakter legyen");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordsNoMatch") || "A jelszavak nem egyeznek");
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
      await signupMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        plan: "essential",
      });
      
      setSuccess(true);
      
      // Ha van promó kód, elmentjük localStorage-be
      if (promoCode.trim()) {
        localStorage.setItem("skinguard_pending_promo", promoCode.trim().toUpperCase());
      }
      
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    } catch (err: any) {
      const msg = err.message || t("auth.accountCreationFailed") || "Sikertelen regisztráció";
      const isEmailConflict =
        msg.toLowerCase().includes("already") ||
        msg.toLowerCase().includes("exist") ||
        msg.toLowerCase().includes("registered") ||
        msg.toLowerCase().includes("duplicate");
      if (isEmailConflict) {
        setError(t("auth.emailAlreadyRegistered") || "Ez az e-mail már regisztrálva van. Átirányítás a bejelentkezési oldalra...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
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
          <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
            {t("auth.startJourney")}
          </h1>
          <p className="text-slate-600">
            {t("auth.signUpSubtitle")}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
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
              <p className="text-sm text-green-700">{t("auth.accountCreated")}</p>
            </motion.div>
          )}

          {/* Social Login Buttons */}
          <div className="mb-6 space-y-3">
            <p className="text-xs text-slate-500 text-center font-medium">{t("auth.signUpWith")}</p>
            <button
              type="button"
              onClick={() => {
                const scope = "openid profile email";
                const responseType = "code";
                const redirectUri = `${getOAuthRedirectUri()}/auth/google/callback`;
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;
                window.location.href = authUrl;
              }}
              className="w-full py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              title="Sign up with Google"
            >
              <Chrome className="w-4 h-4" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-slate-500">{t("auth.orEmail")}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("auth.nameLabel")}
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("auth.createPasswordLabel")}
                </div>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("auth.confirmPwd")}
                </div>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg"
            >
              {isLoading ? t("auth.creatingAccount") : t("auth.createAccountBtn")}
            </Button>
          </form>

          {/* "Már van fiókja? Jelentkezzen be itt" */}
          <div className="text-center mt-6 pt-4 border-t border-slate-200">
            <p className="text-slate-600">
              {t("auth.haveAccount")}{" "}
              <Link href="/login" className="text-cyan-600 hover:underline font-medium">
                {t("auth.signInHere")}
              </Link>
            </p>
          </div>

          {/* Promo Code - nagyobb gomb */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowPromoField(v => !v)}
              className="w-full py-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-800 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              <span>{showPromoField ? "PROMÓ KÓD ELREJTÉSE" : "PROMÓ KÓD"}</span>
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

          {/* Terms */}
          <p className="text-xs text-slate-600 text-center mt-6">
            {t("auth.agreeTerms")}{" "}
            <Link href="/legal" className="text-cyan-600 hover:underline">
              {t("auth.terms")}
            </Link>
            {" "}{t("auth.and")}{" "}
            <Link href="/legal" className="text-cyan-600 hover:underline">
              {t("auth.privacy")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}