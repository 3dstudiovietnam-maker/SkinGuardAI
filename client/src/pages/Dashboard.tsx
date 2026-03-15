/* DermIQ Dashboard - Clinical Serenity Design */
import { Link } from "wouter";
import { Plus, MapPin, Clock, AlertTriangle, CheckCircle, ChevronRight, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSkinStore } from "@/contexts/SkinStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

// Plan feature data for the logged-in dashboard card
const PLAN_INFO: Record<string, { labelKey: string; color: string; featureKeys: string[] }> = {
  essential: {
    labelKey: "userDashboard.planEssential",
    color: "border-slate-200 bg-slate-50",
    featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_4", "pricing.feat_5"],
  },
  pro: {
    labelKey: "userDashboard.planPro",
    color: "border-primary/40 bg-primary/5",
    featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
  },
  pro_plus: {
    labelKey: "userDashboard.planProPlus",
    color: "border-primary/40 bg-primary/5",
    featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11"],
  },
  lifetime: {
    labelKey: "userDashboard.planLifetime",
    color: "border-amber-400 bg-amber-50",
    featureKeys: ["pricing.feat_2", "pricing.feat_3", "pricing.feat_5", "pricing.feat_6", "pricing.feat_7", "pricing.feat_8", "pricing.feat_9", "pricing.feat_10", "pricing.feat_11", "userDashboard.planLifetimeFeature"],
  },
};

export default function Dashboard() {
  const { moles } = useSkinStore();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();

  const totalMoles = moles.length;
  const totalPhotos = moles.reduce((sum, m) => sum + m.photos.length, 0);
  const highRisk = moles.filter(m => m.riskLevel === "high").length;
  const needsCheck = moles.filter(m => {
    const daysSince = (Date.now() - m.lastChecked) / (1000 * 60 * 60 * 24);
    return daysSince > m.reminderDays;
  }).length;

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-3">{t('dashboard.yourDashboard')}</h1>
          <p className="text-muted-foreground mb-6">{t('dashboard.signInDesc')}</p>
          <Button className="bg-primary hover:bg-primary/90">{t('dashboard.getStarted')}</Button>
        </div>
      </div>
    );
  }

  const plan = (user as any)?.plan as string | undefined;
  const planInfo = PLAN_INFO[plan ?? "essential"] ?? PLAN_INFO["essential"];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.overview')}</p>
        </div>
        <Link href="/capture">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1.5" /> {t('dashboard.newCapture')}
          </Button>
        </Link>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`rounded-2xl border-2 p-5 mb-8 ${planInfo.color}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {plan === "lifetime" ? (
              <Zap className="w-5 h-5 text-amber-500" />
            ) : (
              <Shield className="w-5 h-5 text-primary" />
            )}
            <span className="font-semibold text-sm">{t(planInfo.labelKey)}</span>
          </div>
          {(plan === "essential" || !plan) && (
            <Link href="/pricing">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">
                {t('dashboard.upgradePlan')}
              </Button>
            </Link>
          )}
          {(plan === "pro" || plan === "pro_plus") && (
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary">
                {t('dashboard.viewPlans')}
              </Button>
            </Link>
          )}
        </div>
        
        {/* Free scans info - csak Essential esetén jelenik meg */}
        {(plan === "essential" || !plan) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {t('dashboard.freeScansInfo') || "10 ingyenes AI elemzés"}
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {planInfo.featureKeys.map((k, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
              <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
              {t(k)}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('dashboard.trackedMoles'), value: totalMoles, icon: MapPin, color: "text-primary" },
          { label: t('dashboard.totalPhotos'), value: totalPhotos, icon: Clock, color: "text-blue-600" },
          { label: t('dashboard.needsCheck'), value: needsCheck, icon: AlertTriangle, color: "text-amber-600" },
          { label: t('dashboard.highRisk'), value: highRisk, icon: AlertTriangle, color: "text-red-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl border border-border/60 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-heading text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Mole List */}
      <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-heading text-lg font-semibold">{t('dashboard.yourTrackedMoles')}</h2>
        </div>
        {moles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-heading font-semibold mb-2">{t('dashboard.noMolesYet')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('dashboard.noMolesDesc')}</p>
            <Link href="/capture">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1.5" /> {t('dashboard.addFirstMole')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {moles.map(mole => {
              const daysSince = Math.floor((Date.now() - mole.lastChecked) / (1000 * 60 * 60 * 24));
              const needsCheckup = daysSince > mole.reminderDays;
              return (
                <Link key={mole.id} href={`/mole/${mole.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    {mole.photos.length > 0 ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                        <img src={mole.photos[mole.photos.length - 1].dataUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{mole.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mole.region} &middot; {mole.photos.length} {t('dashboard.photosLabel')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {needsCheckup ? (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> {t('dashboard.checkDue')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> OK
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link href="/body-map">
          <div className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">{t('dashboard.bodyMap')}</h3>
                <p className="text-xs text-muted-foreground">{t('dashboard.bodyMapDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </div>
        </Link>
        <Link href="/capture">
          <div className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">{t('dashboard.newCapture')}</h3>
                <p className="text-xs text-muted-foreground">{t('dashboard.newCaptureDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}