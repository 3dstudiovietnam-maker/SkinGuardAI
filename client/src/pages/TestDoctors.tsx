import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Search, Navigation, ExternalLink, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TestDoctors() {
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(false);

  // Open Google Maps with GPS coordinates
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGpsError(true);
      return;
    }
    setLocating(true);
    setGpsError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const url = `https://www.google.com/maps/search/dermatologist/@${lat},${lon},12z`;
        window.open(url, "_blank", "noopener,noreferrer");
        setLocating(false);
      },
      () => {
        setLocating(false);
        setGpsError(true);
      }
    );
  };

  // Open Google Maps with typed city/location
  const handleTextSearch = () => {
    if (!searchText.trim()) return;
    const query = `dermatologist near ${searchText.trim()}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Sub-nav */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            { href: "/test", label: t("test.navTest") },
            { href: "/test/knowledge", label: t("test.navKnowledge") },
            { href: "/test/doctors", label: t("test.navDoctors") },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="inline-block px-4 py-3 text-sm font-medium text-slate-600 hover:text-cyan-600 whitespace-nowrap border-b-2 border-transparent hover:border-cyan-500 transition-colors cursor-pointer">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/test">
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-600 cursor-pointer mb-6">
            <ChevronLeft className="w-4 h-4" />
            {t("test.backToTest")}
          </span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-4xl text-center mb-3">🩺</div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 text-center mb-2">
            {t("test.doctorsNearby")}
          </h1>
          <p className="text-center text-slate-500 text-sm mb-8">
            {t("test.doctorsSubtitle")}
          </p>
        </motion.div>

        {/* Search controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-6"
        >
          {/* GPS → Google Maps button */}
          <Button
            onClick={handleGeolocate}
            disabled={locating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-14 font-semibold text-base gap-2"
          >
            {locating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("test.locating")}
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                {t("test.findDoctorsGps")}
                <ExternalLink className="w-4 h-4 opacity-70" />
              </>
            )}
          </Button>

          {gpsError && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {t("test.errorLocationDesc")}
            </p>
          )}

          {/* OR divider */}
          <div className="relative flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs text-slate-400 uppercase">{t("test.orText")}</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Text search → Google Maps */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSearch()}
                placeholder={t("test.searchCity")}
                className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <Button
              onClick={handleTextSearch}
              disabled={!searchText.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl px-5 gap-1.5"
            >
              <Search className="w-4 h-4" />
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Button>
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-start gap-3">
            <Map className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">{t("test.googleMapsTitle")}</p>
              <p className="text-xs text-blue-600 leading-relaxed">{t("test.googleMapsDesc")}</p>
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 mb-10"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            {t("test.searchTips")}
          </p>
          {[
            t("test.tip1"),
            t("test.tip2"),
            t("test.tip3"),
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
              {tip}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center pt-6 border-t border-slate-200">
          <p className="text-slate-500 text-sm mb-3">{t("test.tryApp")}</p>
          <Link href="/signup">
            <span className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl cursor-pointer transition-colors">
              {t("test.registerNow")} →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
