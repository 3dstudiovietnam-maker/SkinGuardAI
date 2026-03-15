/* DermIQ Body Map - Interactive SVG Body Diagram */
import { Link } from "wouter";
import { useSkinStore } from "@/contexts/SkinStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { MapPin, Plus, ChevronRight } from "lucide-react";
import { useState } from "react";

interface BodyRegion {
  id: string;
  labelKey: string;
  cx: number;
  cy: number;
}

const bodyRegions: BodyRegion[] = [
  { id: "Head",        labelKey: "bodyMap.regions.head",       cx: 150, cy: 30  },
  { id: "Face",        labelKey: "bodyMap.regions.face",       cx: 150, cy: 55  },
  { id: "Neck",        labelKey: "bodyMap.regions.neck",       cx: 150, cy: 85  },
  { id: "Chest",       labelKey: "bodyMap.regions.chest",      cx: 150, cy: 130 },
  { id: "Abdomen",     labelKey: "bodyMap.regions.abdomen",    cx: 150, cy: 180 },
  { id: "Left Arm",    labelKey: "bodyMap.regions.leftArm",    cx: 85,  cy: 160 },
  { id: "Right Arm",   labelKey: "bodyMap.regions.rightArm",   cx: 215, cy: 160 },
  { id: "Left Hand",   labelKey: "bodyMap.regions.leftHand",   cx: 70,  cy: 220 },
  { id: "Right Hand",  labelKey: "bodyMap.regions.rightHand",  cx: 230, cy: 220 },
  { id: "Upper Back",  labelKey: "bodyMap.regions.upperBack",  cx: 150, cy: 115 },
  { id: "Lower Back",  labelKey: "bodyMap.regions.lowerBack",  cx: 150, cy: 200 },
  { id: "Left Thigh",  labelKey: "bodyMap.regions.leftThigh",  cx: 125, cy: 260 },
  { id: "Right Thigh", labelKey: "bodyMap.regions.rightThigh", cx: 175, cy: 260 },
  { id: "Left Leg",    labelKey: "bodyMap.regions.leftLeg",    cx: 125, cy: 330 },
  { id: "Right Leg",   labelKey: "bodyMap.regions.rightLeg",   cx: 175, cy: 330 },
  { id: "Left Foot",   labelKey: "bodyMap.regions.leftFoot",   cx: 125, cy: 390 },
  { id: "Right Foot",  labelKey: "bodyMap.regions.rightFoot",  cx: 175, cy: 390 },
];

export default function BodyMap() {
  const { moles } = useSkinStore();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const getMoleCount = (region: string) => moles.filter(m => m.region === region).length;
  const regionMoles = selectedRegion ? moles.filter(m => m.region === selectedRegion) : [];

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-3">{t('bodyMap.signInTitle')}</h1>
          <p className="text-muted-foreground mb-6">{t('bodyMap.signInDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold mb-2">{t('bodyMap.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('bodyMap.subtitle')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* SVG Body Map */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="relative w-full max-w-sm">
            <svg viewBox="0 0 300 420" className="w-full h-auto">
              {/* Body outline */}
              <ellipse cx="150" cy="35" rx="28" ry="32" fill="#E8F0E8" stroke="#4A7C59" strokeWidth="1.5" />
              <rect x="135" y="65" width="30" height="20" rx="8" fill="#E8F0E8" stroke="#4A7C59" strokeWidth="1.5" />
              <path d="M110 85 L110 200 Q110 210 120 210 L180 210 Q190 210 190 200 L190 85 Z" fill="#E8F0E8" stroke="#4A7C59" strokeWidth="1.5" />
              {/* Arms */}
              <path d="M110 90 L80 160 L70 220 L80 225 L95 170 L110 120" fill="#E8F0E8" stroke="#4A7C59" strokeWidth="1.5" />
              <path d="M190 90 L220 160 L230 220 L220 225 L205 170 L190 120" fill="#E8F0E8" stroke="#4A7C59" strokeWidth="1.5" />
              {/* Legs */}
              <path d="M120 210 L115 300 L110 390 L130 395 L135 310 L140 210" fill="#E8F0E8" stroke="#4A7C59" strokeWidth="1.5" />
              <path d="M160 210 L165 300 L170 390 L190 395 L185 310 L180 210" fill="#E8F0E8" stroke="#4A7C59" strokeWidth="1.5" />

              {/* Interactive region dots */}
              {bodyRegions.map(region => {
                const count = getMoleCount(region.id);
                const isSelected = selectedRegion === region.id;
                return (
                  <g key={region.id} onClick={() => setSelectedRegion(region.id)} className="cursor-pointer">
                    <circle
                      cx={region.cx}
                      cy={region.cy}
                      r={isSelected ? 12 : count > 0 ? 10 : 8}
                      fill={count > 0 ? (isSelected ? "#4A7C59" : "#6B9B7A") : (isSelected ? "#4A7C59" : "rgba(74,124,89,0.2)")}
                      stroke={isSelected ? "#2D5A3E" : "transparent"}
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />
                    {count > 0 && (
                      <text x={region.cx} y={region.cy + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                        {count}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Region Detail Panel */}
        <div className="lg:col-span-2">
          {selectedRegion ? (
            <motion.div
              key={selectedRegion}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl border border-border/60 overflow-hidden"
            >
              <div className="p-5 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    {t(bodyRegions.find(r => r.id === selectedRegion)?.labelKey || 'bodyMap.title')}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {regionMoles.length} {t('bodyMap.molesTracked')}
                  </p>
                </div>
                <Link href={`/capture/${encodeURIComponent(selectedRegion)}`}>
                  <button className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </Link>
              </div>
              {regionMoles.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-3">{t('bodyMap.noMolesInRegion')}</p>
                  <Link href={`/capture/${encodeURIComponent(selectedRegion)}`}>
                    <button className="text-sm text-primary font-medium hover:underline">
                      {t('bodyMap.addMole')}
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {regionMoles.map(mole => (
                    <Link key={mole.id} href={`/mole/${mole.id}`}>
                      <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                        {mole.photos.length > 0 ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img src={mole.photos[mole.photos.length - 1].dataUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{mole.name}</p>
                          <p className="text-xs text-muted-foreground">{mole.photos.length} photos</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-card rounded-2xl border border-border/60 p-8 text-center">
              <MapPin className="w-10 h-10 text-primary/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t('bodyMap.tapRegion')}</p>
            </div>
          )}

          {/* Region Legend */}
          <div className="mt-4 bg-card rounded-2xl border border-border/60 p-4">
            <h3 className="font-heading text-sm font-semibold mb-3">{t('bodyMap.allRegions')}</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {bodyRegions.map(r => {
                const count = getMoleCount(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      selectedRegion === r.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    <span>{t(r.labelKey)}</span>
                    {count > 0 && (
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-semibold">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
