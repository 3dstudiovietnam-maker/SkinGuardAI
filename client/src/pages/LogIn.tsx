import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, Lock, AlertCircle, CheckCircle, Chrome, Gift, Shield, Star, Zap, Check } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthLanguageSelector } from "@/components/LanguageSelector";
import { useSkinStore } from "@/contexts/SkinStore"; // <-- IMPORTÁLNI KELL!

const getOAuthRedirectUri = () => window.location.origin;

// SPRING definiálva - ez kellett
const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

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
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  // Promo code — pre-fill from localStorage if signup stored one
  const pendingPromo = typeof window !== "undefined" ? (localStorage.getItem("skinguard_pending_promo") ?? "") : "";
  const [promoCode, setPromoCode] = useState(pendingPromo);
  const [showPromoField, setShowPromoField] = useState(!!pendingPromo);

  const loginMutation = trpc.auth.loginEmail.useMutation();
  const updatePlanMutation = trpc.auth.updatePlan.useMutation();
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

      // If user is on Essential plan, show plan selection
      if (result.plan === "essential") {
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

  const handlePlanSelect = async (plan: "essential" | "pro" | "pro_plus") => {
    setIsLoading(true);
    try {
      await updatePlanMutation.mutateAsync({ plan });
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to update plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardAction = async (id: "essential" | "pro" | "pro_plus" | "lifetime") => {
    if (id === "lifetime") {
      window.open("https://noxuniverse.gumroad.com/l/skinguardailifetime", "_blank");
      return;
    }
    if (id === "essential") {
      await handlePlanSelect("essential");
    } else {
      window.open("https://noxuniverse.gumroad.com/l/skinguardpro", "_blank");
    }
  };

  // ── Plan Selection Screen ────────────────────────────────────────────────
  if (showPlanSelection) {
    const planCards = [
      {
        id: "essential" as const,
        name: "Essential",
        price: "$0",
        priceNoteKey: "pricing.freeForever",
        badgeKey: null as string | null,
        featureKeys: ["pricing.feat_1", "pricing.feat_2", "pricing.feat_3", "pricing.feat_4", "pricing.feat_5"],
        ctaKey: "pricing.ctaStartFree",
        special: "10 free scans",
        gumroad: null,
      },
      {
        id: "pro" as const,
        name: "Pro",
        price: "$6.99",
        priceNoteKey: "pricing.perMonth",
        badgeKey: "pricing.mostPopular",
        featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
        ctaKey: "pricing.ctaGetPro",
        special: "Unlimited scans",
        gumroad: "https://noxuniverse.gumroad.com/l/skinguardpro",
      },
      {
        id: "pro_plus" as const,
        name: "Pro Plus",
        price: "$49",
        priceNoteKey: "pricing.perYear",
        badgeKey: "pricing.bestAnnualValue",
        featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
        ctaKey: "pricing.ctaGetProPlus",
        special: "Unlimited scans",
        gumroad: "https://noxuniverse.gumroad.com/l/skinguardproplus",
      },
      {
        id: "lifetime" as const,
        name: "Lifetime",
        price: "$69",
        priceNoteKey: "pricing.oneTime",
        badgeKey: "pricing.bestDeal",
        featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
        ctaKey: "pricing.ctaGetLifetime",
        special: "Unlimited scans",
        gumroad: "https://noxuniverse.gumroad.com/l/skinguardailifetime",
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">
              {t("auth.choosePlan")}
            </h1>
            <p className="text-slate-600">
              {t("auth.choosePlanSubtitle")}
            </p>
          </div>

          {/* Plans Grid - Teljes kártya kattintható */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Essential */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("essential")}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col cursor-pointer hover:border-cyan-300 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <h3 className="font-heading text-xl font-bold">Essential</h3>
              </div>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-3xl font-bold">$0</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">{t("pricing.freeForever")}</p>
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-amber-700">⚡ {planCards[0].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[0].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="text-slate-700">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro — Most Popular */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("pro")}
              className="bg-white rounded-2xl border-2 border-cyan-600 p-6 flex flex-col relative cursor-pointer hover:border-cyan-700 transition-all"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <Star className="w-3 h-3" /> {t("pricing.mostPopular")}
              </div>
              <h3 className="font-heading text-xl font-bold mt-4">Pro</h3>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-3xl font-bold">$6.99</span>
                <span className="text-slate-500 text-sm pb-1">{t("pricing.perMonth")}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{t("pricing.advancedAI")}</p>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-green-700">∞ {planCards[1].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[1].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="text-slate-700">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro Plus */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("pro_plus")}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col cursor-pointer hover:border-cyan-300 transition-all"
            >
              <h3 className="font-heading text-xl font-bold mb-2">Pro Plus</h3>
              <div className="flex items-end gap-1.5 mt-2 flex-wrap">
                <span className="font-heading text-3xl font-bold">$49</span>
                <span className="text-slate-500 text-sm pb-1">{t("pricing.perYear")}</span>
                <span className="text-slate-400 text-xs pb-1">($4.08/hó)</span>
              </div>
              <div className="mt-2 mb-4">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  {t("pricing.bestAnnualValue")} — {t("pricing.save41")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-green-700">∞ {planCards[2].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[2].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="text-slate-700">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Lifetime */}
            <motion.div
              whileHover={{ scale: 1.04, y: -8 }}
              transition={spring}
              onClick={() => handleCardAction("lifetime")}
              className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-400 p-6 flex flex-col relative cursor-pointer hover:border-amber-500 transition-all"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                <Zap className="w-3 h-3" /> {t("pricing.bestDeal")}
              </div>
              <h3 className="font-heading text-xl font-bold mt-4">Lifetime</h3>
              <div className="flex items-end gap-1 mt-2 mb-1">
                <span className="font-heading text-3xl font-bold">$69</span>
                <span className="text-slate-500 text-sm pb-1">{t("pricing.oneTime")}</span>
              </div>
              <p className="text-sm text-amber-600 mb-4">{t("pricing.payOnce")}</p>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mb-4">
                <span className="text-xs font-semibold text-green-700">∞ {planCards[3].special}</span>
              </div>
              <div className="space-y-2.5 flex-1">
                {planCards[3].featureKeys.map((key, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-slate-700">{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Login Form ────────────────────────────────────────────────────────────
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
            {t("auth.welcomeBack")}
          </h1>
          <p className="text-slate-600">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {/* Social Login Buttons */}
          <div className="mb-6 space-y-3">
            <p className="text-xs text-slate-500 text-center font-medium">{t("auth.signInWith")}</p>
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
              className="w-full py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              title="Sign in with Google"
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
                  {t("auth.passwordLabel")}
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
          <div className="text-center mt-6 pt-4 border-t border-slate-200">
            <p className="text-slate-600">
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
              <span>{showPromoField ? "PROMO CODE ELREJTÉSE" : "PROMO CODE"}</span>
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