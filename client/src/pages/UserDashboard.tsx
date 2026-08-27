import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, BarChart3, Heart, Settings, LogOut, Zap, Shield, Clock, Trash2, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Every plan label carries its price ("Pro ($6.90/month)"), and those strings are
// deleted from the native build's translations table (Apple 2.3.1). The plan
// still has to be named on screen, so the native build uses these price-free
// labels; they are product names and are not translated anywhere.
const NATIVE_PLAN_LABEL: Record<string, string> = {
  essential: "Essential",
  pro: "Pro",
  pro_plus: "Pro Plus",
  lifetime: "Lifetime Access",
};

export default function UserDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useLanguage();

  // Apple 2.3.1/3.1.1 — every price, upgrade CTA and pricing link is compiled
  // OUT of the native build (__NATIVE_BUILD__ is a literal the bundler folds),
  // instead of being hidden at runtime with the shipped binary still carrying it.

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('userDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('userDashboard.accessDenied')}</CardTitle>
            <CardDescription>{t('userDashboard.pleaseLogin')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                {t('userDashboard.goToLogin')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutMutation.mutateAsync();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountMutation.mutateAsync();
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Account deletion failed:", error);
      setIsDeleting(false);
    }
  };

  const planFeatures = {
    essential: {
      nameKey: "userDashboard.planEssential",
      color: "bg-blue-50 border-blue-200",
      featureKeys: [
        "pricing.feat_1",
        "pricing.feat_2",
        "pricing.feat_3",
        "pricing.feat_4",
        "pricing.feat_5",
      ],
    },
    pro: {
      // Web-only: this label carries the price, so the native build holds
      // neither the text nor a reference to it (Apple 2.3.1) — it shows
      // NATIVE_PLAN_LABEL instead.
      nameKey: __NATIVE_BUILD__ ? "" : "userDashboard.planPro",
      color: "bg-purple-50 border-purple-200",
      featureKeys: [
        "pricing.feat_1",
        "pricing.feat_2",
        "pricing.feat_3",
        "pricing.feat_5",
        "pricing.feat_6",
        "pricing.feat_7",
        "pricing.feat_8",
        "pricing.feat_9",
        "pricing.feat_10",
        "pricing.feat_11",
      ],
    },
    pro_plus: {
      // Web-only: this label carries the price, so the native build holds
      // neither the text nor a reference to it (Apple 2.3.1) — it shows
      // NATIVE_PLAN_LABEL instead.
      nameKey: __NATIVE_BUILD__ ? "" : "userDashboard.planProPlus",
      color: "bg-amber-50 border-amber-200",
      featureKeys: [
        "pricing.feat_1",
        "pricing.feat_2",
        "pricing.feat_3",
        "pricing.feat_5",
        "pricing.feat_6",
        "pricing.feat_7",
        "pricing.feat_8",
        "pricing.feat_9",
        "pricing.feat_10",
        "pricing.feat_11",
      ],
    },
    lifetime: {
      // Web-only: this label carries the price, so the native build holds
      // neither the text nor a reference to it (Apple 2.3.1) — it shows
      // NATIVE_PLAN_LABEL instead.
      nameKey: __NATIVE_BUILD__ ? "" : "userDashboard.planLifetime",
      color: "bg-amber-50 border-amber-400",
      featureKeys: [
        "pricing.feat_1",
        "pricing.feat_2",
        "pricing.feat_3",
        "pricing.feat_5",
        "pricing.feat_6",
        "pricing.feat_7",
        "pricing.feat_8",
        "pricing.feat_9",
        "pricing.feat_10",
        "pricing.feat_11",
        "userDashboard.planLifetimeFeature",
      ],
    },
  };

  const currentPlan = planFeatures[user.plan as keyof typeof planFeatures] || planFeatures.essential;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('userDashboard.welcomeBack')} {user.name}!</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('userDashboard.subtitle')}</p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="border-slate-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? t('userDashboard.loggingOut') : t('userDashboard.logout')}
          </Button>
        </div>

        {/* Current Plan Card */}
        <Card className={`mb-8 border-2 ${currentPlan.color}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{__NATIVE_BUILD__ ? NATIVE_PLAN_LABEL[user.plan] ?? "" : t(currentPlan.nameKey)}</CardTitle>
                <CardDescription>{t('userDashboard.currentPlanDesc')}</CardDescription>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            {user.plan === "essential" && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                <span className="text-sm font-semibold text-amber-700">{t('userDashboard.freeScansIncluded')}</span>
                {!__NATIVE_BUILD__ && <span className="text-sm text-amber-600">{t('userDashboard.upgradeForUnlimited')}</span>}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {currentPlan.featureKeys.map((key, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t(key)}</span>
                </div>
              ))}
            </div>
            {!__NATIVE_BUILD__ && user.plan === "essential" && (
              <Link href="/pricing">
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  {t('userDashboard.upgradeToPro')}
                </Button>
              </Link>
            )}
            {!__NATIVE_BUILD__ && (user.plan === "pro" || user.plan === "pro_plus") && (
              <Link href="/pricing">
                <Button variant="outline" className="border-slate-300 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                  {t('userDashboard.viewAllPlans')}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Capture Scan */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="text-lg">{t('userDashboard.newScan')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('userDashboard.newScanDesc')}
              </p>
              <Link href="/capture">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                  {t('userDashboard.startScan')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Health Report */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">{t('userDashboard.healthReport')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('userDashboard.healthReportDesc')}
              </p>
              <Link href="/health-report">
                <Button variant="outline" className="w-full border-slate-300">
                  {t('userDashboard.viewReport')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">{t('userDashboard.analytics')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('userDashboard.analyticsDesc')}
              </p>
              <Button variant="outline" className="w-full border-slate-300" disabled>
                {t('userDashboard.comingSoon')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('userDashboard.accountSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t('userDashboard.labelName')}</p>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">{user.name}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t('userDashboard.labelEmail')}</p>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">{user.email}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t('userDashboard.labelPlan')}</p>
                  <p className="text-slate-900 dark:text-slate-100 font-medium capitalize">{user.plan}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{t('userDashboard.labelMemberSince')}</p>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button variant="outline" className="border-slate-300" disabled>
                  {t('userDashboard.editProfile')}
                </Button>
                <Button variant="outline" className="border-slate-300" disabled>
                  {t('userDashboard.changePassword')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-cyan-50 border border-cyan-200 rounded-lg">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('userDashboard.needHelp')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {t('userDashboard.needHelpDesc')}
              </p>
              <div className="flex gap-3">
                <Link href="/faq">
                  <Button size="sm" variant="outline" className="border-cyan-300">
                    {t('userDashboard.viewFaq')}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="sm" variant="outline" className="border-cyan-300">
                    {t('userDashboard.contactSupport')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone — permanent account deletion (GDPR/CCPA + Apple 5.1.1(v)) */}
        <div className="mt-8 p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">{t('userDashboard.dangerZone')}</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">{t('userDashboard.deleteDesc')}</p>
              {!confirmDelete ? (
                <Button
                  onClick={() => setConfirmDelete(true)}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/40"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('userDashboard.deleteBtn')}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">{t('userDashboard.deleteConfirmWarn')}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? t('userDashboard.deleting') : t('userDashboard.deleteConfirmYes')}
                    </Button>
                    <Button
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                      variant="outline"
                      className="border-slate-300"
                    >
                      {t('userDashboard.deleteCancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
