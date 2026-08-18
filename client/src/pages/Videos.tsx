import { Play, X, Clock, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Video {
  id: string;
  titleKey: string;
  descKey: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  type: "demo" | "trending" | "explainer";
}

interface UpcomingVideo {
  id: string;
  titleKey: string;
  descKey: string;
  thumbnail: string;
  duration: string;
  type: "tutorial" | "interview" | "story" | "tips";
}

/**
 * Thumbnails are bundled assets, not remote stock photos.
 *
 * These used to point at images.unsplash.com. In the native shell the whole web
 * build ships inside the binary, so every card on this page went blank the
 * moment the device was offline or the CDN was slow — and an App Review device
 * on a throttled network is exactly that case. They were also generic stock
 * photos of unrelated lab scenes standing in for our own videos. Both problems
 * disappear by using the images we already ship in /cdn.
 */
const videos: Video[] = [
  {
    id: "app-demo",
    titleKey: "videos.v1Title",
    descKey: "videos.v1Desc",
    thumbnail: "/cdn/skinguard-hero-3d-dxG4qYePkYE5GXRkK2HRWb.webp",
    videoUrl: "/cdn/video-1-app-demo_e4478692.mp4",
    duration: "0:30",
    type: "demo"
  },
  {
    id: "trending",
    titleKey: "videos.v2Title",
    descKey: "videos.v2Desc",
    thumbnail: "/cdn/photo-guide-close-clear-ax4jkAFvPvwifxMphXMUqa.webp",
    videoUrl: "/cdn/video-2-trending-audio_82682e80.mp4",
    duration: "0:30",
    type: "trending"
  },
  {
    id: "explainer",
    titleKey: "videos.v3Title",
    descKey: "videos.v3Desc",
    thumbnail: "/cdn/photography-guide_35cf840e.png",
    videoUrl: "/cdn/video-3-explainer_5518eb78.mp4",
    duration: "0:45",
    type: "explainer"
  }
];

const upcomingVideos: UpcomingVideo[] = [
  {
    id: "body-map-tutorial",
    titleKey: "videos.u1Title",
    descKey: "videos.u1Desc",
    thumbnail: "/cdn/photo-guide-good-lighting-VBaTFkQqNDHKVDFqjTzbGr.webp",
    duration: "~3:00",
    type: "tutorial",
  },
  // Removed: the announced "Dermatologist Q&A" and "Patient Story" videos.
  // Neither exists, and advertising an unrecorded expert endorsement / patient
  // success story is fabricated social proof (FTC 16 CFR Part 465, App Store 1.4.1).
  // Only announce content that is actually in production.
];

export default function Videos() {
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const getTypeLabel = (type: string) => {
    const keyMap: Record<string, string> = {
      demo:      "videos.typeDemo",
      trending:  "videos.typeTrending",
      explainer: "videos.typeExplainer",
      tutorial:  "videos.typeTutorial",
      interview: "videos.typeInterview",
      story:     "videos.typeStory",
      tips:      "videos.typeTips",
    };
    return t(keyMap[type] || "videos.typeDemo");
  };

  const selectedVideoData = videos.find(v => v.id === selectedVideo);

  return (
    <div className="container py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
          {t('videos.title')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t('videos.subtitle')}
        </p>
      </motion.div>

      {/* Available Videos */}
      <div className="mb-4">
        <h2 className="font-heading text-2xl font-bold mb-6">{t('videos.watchNow')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
            onClick={() => setSelectedVideo(video.id)}
          >
            <div className="relative rounded-xl overflow-hidden bg-card border border-border/60 mb-4">
              {/* Thumbnail */}
              <img
                src={video.thumbnail}
                alt={t(video.titleKey)}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                {video.duration}
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                {getTypeLabel(video.type)}
              </div>
            </div>

            {/* Info */}
            <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
              {t(video.titleKey)}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {t(video.descKey)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-heading text-2xl font-bold">{t('videos.comingSoon')}</h2>
        <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold px-3 py-1 rounded-full">
          {t('videos.inProduction')}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {upcomingVideos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="relative rounded-xl overflow-hidden bg-card border border-border/60 mb-4">
              {/* Thumbnail */}
              <img
                src={video.thumbnail}
                alt={t(video.titleKey)}
                className="w-full h-48 object-cover opacity-50"
              />

              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                  <Film className="w-6 h-6 text-white/60" />
                </div>
                <span className="text-white font-semibold text-sm">{t('videos.comingSoon')}</span>
              </div>

              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white/70 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration}
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2 bg-muted text-muted-foreground text-xs font-semibold px-2 py-1 rounded">
                {getTypeLabel(video.type)}
              </div>

              {/* ETA badge */}
              <div className="absolute top-2 right-2 bg-amber-500/80 text-white text-xs font-semibold px-2 py-1 rounded">
                {t('videos.comingSoon')}
              </div>
            </div>

            {/* Info */}
            <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
              {t(video.titleKey)}
            </h3>
            <p className="text-xs text-muted-foreground/70 line-clamp-2">
              {t(video.descKey)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideoData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              {/* playsInline is not cosmetic on iOS: without it WKWebView takes the
                  video fullscreen the instant it starts, tearing the user out of
                  the modal, and autoplay with sound is refused outright so the
                  player just sits black. Inline + muted lets it start where it is;
                  controls let the viewer unmute. */}
              <video
                src={selectedVideoData.videoUrl}
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                className="w-full rounded-lg"
              />
              <div className="mt-4 text-white">
                <h3 className="font-semibold text-lg mb-2">{t(selectedVideoData.titleKey)}</h3>
                <p className="text-sm text-gray-300">{t(selectedVideoData.descKey)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-8 md:p-12 text-center mb-12"
      >
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
          {t('videos.shareTitle')}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          {t('videos.shareSubtitle')}
        </p>
        {/*
          The "Download All Videos" button that used to sit here pointed at
          https://bit.ly/skinguardai. That short link resolves to
          https://3000-ionh6p7y81zplj94ebjlx-796f4523.us1.manus.computer/ — an
          expired ephemeral build-sandbox host that now answers HTTP 502 (checked
          2026-08-18). So the app's own page offered a download that led nowhere,
          through a shortened URL whose destination neither the user nor an App
          Review engineer can see, and which is not a domain we control. That is
          a dead advertised feature (Guideline 2.3.1) and a link we cannot vouch
          for. There is no download endpoint in this app — the three videos are
          bundled and play in-app — so the button is removed rather than repointed.
        */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://www.facebook.com/share/g/1aSGhpR12p/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-card border border-primary/40 text-primary px-6 py-3 rounded-lg font-semibold hover:bg-card/80 transition-colors"
          >
            {t('videos.joinFacebook')}
          </a>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-card rounded-xl border border-border/60 p-6 text-center">
          <p className="font-heading text-3xl font-bold text-primary mb-2">{videos.length + upcomingVideos.length}</p>
          <p className="text-muted-foreground">{t('videos.videoStats')}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/60 p-6 text-center">
          <p className="font-heading text-3xl font-bold text-primary mb-2">~5 min</p>
          <p className="text-muted-foreground">{t('videos.totalDuration')}</p>
        </div>
        <div className="bg-card rounded-xl border border-border/60 p-6 text-center">
          <p className="font-heading text-3xl font-bold text-primary mb-2">100%</p>
          <p className="text-muted-foreground">{t('videos.freeToShare')}</p>
        </div>
      </motion.div>
    </div>
  );
}
