/*
 * SkinGuard AI - Health Monitor
 * Track weight, BMI, hydration, and sleep for comprehensive health insights
 */
import { TrendingUp, Plus, Trash2, Calendar, Droplet, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface HealthMetric {
  id: string;
  date: string;
  weight: number;
  height?: number;
  hydration?: number;
  sleep?: number;
  notes: string;
}

export default function TestMonitor() {
  const { t } = useLanguage();

  const [metrics, setMetrics] = useState<HealthMetric[]>([
    { id: "1", date: "2026-03-06", weight: 75.5, height: 180, hydration: 2.5, sleep: 7.5, notes: "Post-workout measurement" },
    { id: "2", date: "2026-03-05", weight: 75.8, height: 180, hydration: 2.0, sleep: 7, notes: "Morning measurement" },
    { id: "3", date: "2026-03-04", weight: 76.2, height: 180, hydration: 2.2, sleep: 6.5, notes: "Evening measurement" },
  ]);

  const [newWeight, setNewWeight] = useState("");
  const [newHeight, setNewHeight] = useState("180");
  const [newHydration, setNewHydration] = useState("");
  const [newSleep, setNewSleep] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const calculateBMI = (weight: number, height: number) => {
    if (height <= 0) return 0;
    return (weight / (height * height / 10000)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: t('monitor.bmiUnderweight'), color: "text-blue-600" };
    if (bmi < 25) return { label: t('monitor.bmiNormal'), color: "text-emerald-600" };
    if (bmi < 30) return { label: t('monitor.bmiOverweight'), color: "text-orange-600" };
    return { label: t('monitor.bmiObese'), color: "text-red-600" };
  };

  const handleAddMetric = () => {
    if (!newWeight) {
      toast.error(t('monitor.errorWeight'));
      return;
    }

    const metric: HealthMetric = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(newWeight),
      height: newHeight ? parseFloat(newHeight) : undefined,
      hydration: newHydration ? parseFloat(newHydration) : undefined,
      sleep: newSleep ? parseFloat(newSleep) : undefined,
      notes: newNotes,
    };

    setMetrics([metric, ...metrics]);
    setNewWeight("");
    setNewHeight("180");
    setNewHydration("");
    setNewSleep("");
    setNewNotes("");
    toast.success(t('monitor.successAdded'));
  };

  const handleDeleteMetric = (id: string) => {
    setMetrics(metrics.filter(m => m.id !== id));
    toast.success(t('monitor.successDeleted'));
  };

  const avgWeight = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + m.weight, 0) / metrics.length).toFixed(1)
    : "0";

  const avgHydration = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + (m.hydration || 0), 0) / metrics.length).toFixed(1)
    : "0";

  const avgSleep = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + (m.sleep || 0), 0) / metrics.length).toFixed(1)
    : "0";

  const latestMetric = metrics.length > 0 ? metrics[0] : null;
  const latestBMI = latestMetric && latestMetric.height
    ? calculateBMI(latestMetric.weight, latestMetric.height)
    : "0";
  const bmiCategory = latestBMI !== "0" ? getBMICategory(parseFloat(latestBMI as string)) : null;

  const fitnessRecommendations = [
    {
      titleKey: "monitor.morningStretchingTitle",
      descKey: "monitor.morningStretchingDesc",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/fitness-stretching-3d-446nSrgs3vTdwHVUGiNhQG.webp",
      durationKey: "monitor.morningStretchingDuration",
      stepKeys: [
        "monitor.morningStretchingStep1",
        "monitor.morningStretchingStep2",
        "monitor.morningStretchingStep3",
        "monitor.morningStretchingStep4",
        "monitor.morningStretchingStep5",
      ]
    },
    {
      titleKey: "monitor.lightWalkingTitle",
      descKey: "monitor.lightWalkingDesc",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/fitness-walking-3d-N88k3mKzgtyU3xrZyntqbA.webp",
      durationKey: "monitor.lightWalkingDuration",
      stepKeys: [
        "monitor.lightWalkingStep1",
        "monitor.lightWalkingStep2",
        "monitor.lightWalkingStep3",
        "monitor.lightWalkingStep4",
        "monitor.lightWalkingStep5",
      ]
    },
    {
      titleKey: "monitor.yogaBalanceTitle",
      descKey: "monitor.yogaBalanceDesc",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/fitness-yoga-3d-eN9aPjrJCUJA4nj8VPPN7S.webp",
      durationKey: "monitor.yogaBalanceDuration",
      stepKeys: [
        "monitor.yogaBalanceStep1",
        "monitor.yogaBalanceStep2",
        "monitor.yogaBalanceStep3",
        "monitor.yogaBalanceStep4",
        "monitor.yogaBalanceStep5",
      ]
    }
  ];

  return (
    <div className="container py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
          {t('monitor.title')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t('monitor.subtitle')}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8"
      >
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{t('monitor.avgWeight')}</p>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="font-heading text-3xl font-bold text-primary">{avgWeight} kg</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{t('monitor.currentBMI')}</p>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="font-heading text-3xl font-bold text-cyan-500">{latestBMI}</p>
          {bmiCategory && <p className={`text-xs font-semibold ${bmiCategory.color} mt-1`}>{bmiCategory.label}</p>}
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{t('monitor.avgHydration')}</p>
            <Droplet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="font-heading text-3xl font-bold text-blue-500">{avgHydration}L</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{t('monitor.avgSleep')}</p>
            <Moon className="w-4 h-4 text-purple-500" />
          </div>
          <p className="font-heading text-3xl font-bold text-purple-500">{avgSleep}h</p>
        </div>
      </motion.div>

      {/* Add New Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/60 p-8 max-w-5xl mx-auto mb-8"
      >
        <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          {t('monitor.addNewEntry')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('monitor.weightKg')}</label>
            <input
              type="number"
              step="0.1"
              placeholder="75.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('monitor.heightCm')}</label>
            <input
              type="number"
              step="1"
              placeholder="180"
              value={newHeight}
              onChange={(e) => setNewHeight(e.target.value)}
              className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('monitor.hydrationL')}</label>
            <input
              type="number"
              step="0.1"
              placeholder="2.5"
              value={newHydration}
              onChange={(e) => setNewHydration(e.target.value)}
              className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('monitor.sleepHours')}</label>
            <input
              type="number"
              step="0.5"
              placeholder="7.5"
              value={newSleep}
              onChange={(e) => setNewSleep(e.target.value)}
              className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddMetric}
              className="w-full bg-primary hover:bg-primary/90 h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('monitor.add')}
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">{t('monitor.notes')}</label>
          <input
            type="text"
            placeholder={t('monitor.notesPh')}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </motion.div>

      {/* Metrics List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-5xl mx-auto"
      >
        <h2 className="font-heading text-2xl font-bold mb-6">{t('monitor.recentEntries')}</h2>
        <div className="space-y-3">
          {metrics.map((metric, i) => {
            const bmi = metric.height ? calculateBMI(metric.weight, metric.height) : null;
            const bmiCat = bmi ? getBMICategory(parseFloat(bmi)) : null;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border/60 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{metric.date}</p>
                      {metric.notes && <p className="text-sm text-muted-foreground">{metric.notes}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMetric(metric.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border/60">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('monitor.labelWeight')}</p>
                    <p className="font-heading text-xl font-bold text-primary">{metric.weight} kg</p>
                  </div>
                  {bmi && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('monitor.labelBmi')}</p>
                      <p className={`font-heading text-xl font-bold ${bmiCat?.color}`}>{bmi}</p>
                      <p className={`text-xs font-semibold ${bmiCat?.color}`}>{bmiCat?.label}</p>
                    </div>
                  )}
                  {metric.hydration && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('monitor.labelHydration')}</p>
                      <p className="font-heading text-xl font-bold text-blue-500">{metric.hydration}L</p>
                    </div>
                  )}
                  {metric.sleep && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('monitor.labelSleep')}</p>
                      <p className="font-heading text-xl font-bold text-purple-500">{metric.sleep}h</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Fitness Tips Section */}
      {latestBMI !== "0" && parseFloat(latestBMI as string) > 25 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto mt-12 mb-12"
        >
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl p-8">
            <h2 className="font-heading text-3xl font-bold text-orange-600 mb-3">{t('monitor.fitnessTipsTitle')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('monitor.fitnessTipsSubtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fitnessRecommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  className="bg-white rounded-xl border border-orange-200/60 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={rec.image}
                    alt={t(rec.titleKey)}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-heading text-lg font-bold mb-2 text-slate-900">{t(rec.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t(rec.descKey)}</p>
                    <p className="text-xs font-semibold text-orange-600 mb-3">⏱️ {t(rec.durationKey)}</p>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="font-semibold text-xs text-slate-900 mb-2">{t('monitor.howToDoIt')}</p>
                      <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                        {rec.stepKeys.map((stepKey, stepIdx) => (
                          <li key={stepIdx}>{t(stepKey)}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 bg-white border border-emerald-200/60 rounded-xl p-4">
              <p className="text-sm text-emerald-900">
                {t('monitor.consistencyTip')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-5xl mx-auto mt-12 bg-blue-50 border border-blue-200/60 rounded-2xl p-6"
      >
        <h3 className="font-semibold text-blue-900 mb-3">{t('monitor.whyTrack')}</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>{t('monitor.whyWeightBmi')}</strong></li>
          <li>• <strong>{t('monitor.whyHydration')}</strong></li>
          <li>• <strong>{t('monitor.whySleep')}</strong></li>
          <li>• <strong>{t('monitor.whyHolistic')}</strong></li>
          <li>• <strong>{t('monitor.whyMedical')}</strong></li>
        </ul>
      </motion.div>
    </div>
  );
}
