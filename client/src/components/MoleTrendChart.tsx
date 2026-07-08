import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Per-mole ABCDE evolution over time. The "E" in ABCDE — change — is the strongest
// melanoma signal and the one axis a single photo can't show. Uses the scores we
// already store per photo. No new copy: legend reuses the existing ABCDE labels,
// header is a localized date range. Renders nothing until there are 2+ scored photos.
interface PhotoPoint {
  timestamp: string | Date;
  asymmetryScore: number | null;
  borderScore: number | null;
  colorScore: number | null;
  diameterScore: number | null;
}

export function MoleTrendChart({ photos }: { photos: PhotoPoint[] }) {
  const { language, t } = useLanguage();
  const scored = photos.filter((p) => p.asymmetryScore != null);
  if (scored.length < 2) return null;

  const fmt = (d: string | Date) => new Date(d).toLocaleDateString(language, { month: "short", day: "numeric" });
  const data = scored.map((p) => ({
    label: fmt(p.timestamp),
    A: p.asymmetryScore, B: p.borderScore, C: p.colorScore, D: p.diameterScore,
  }));

  const series = [
    { key: "A", name: `A · ${t("moleDetail.asymmetry")}`, color: "#e11d48" },
    { key: "B", name: `B · ${t("moleDetail.border")}`, color: "#f59e0b" },
    { key: "C", name: `C · ${t("moleDetail.color")}`, color: "#8b5cf6" },
    { key: "D", name: `D · ${t("moleDetail.diameter")}`, color: "#0ea5e9" },
  ];

  return (
    <div className="mt-4 bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">{data[0].label} – {data[data.length - 1].label}</span>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">0–100</span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} width={34} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="plainline" />
            {series.map((s) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
