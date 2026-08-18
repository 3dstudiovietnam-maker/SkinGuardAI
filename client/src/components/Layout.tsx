/*
 * Bright teal navigation, clean white background, professional typography
 */
import { Link, useLocation, useRoute } from "wouter";
import LogoVideo from "@/components/LogoVideo";
import { Shield, LayoutDashboard, User, Camera, MapPin, CreditCard, Menu, X, LogIn, LogOut, FileText, TrendingUp, Facebook, Mail, UserPlus, Video, HelpCircle, Phone, Github, Twitter, Instagram, Linkedin, Youtube, Heart, Info, FlaskConical, BookOpen, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useSkinStore } from "@/contexts/SkinStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const { logout: storeLogout } = useSkinStore();
  const { t } = useLanguage();

  // Apple 3.1.1 — hide pricing entry points inside the native (Capacitor) app
  const isNative = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

  const handleLogout = async () => {
    try {
      await authLogout();
    } catch {
      // ha hiba volt, akkor is kiléptetjük
    }
    storeLogout();
    window.location.href = "/";
  };

  /*
   * The footer newsletter sign-up has been removed.
   *
   * It was not connected to anything. The submit handler awaited a 1-second
   * setTimeout and then displayed "✓ Subscribed! Thanks for joining." next to
   * the words "Unsubscribe at any time" — while the address the user had just
   * typed was thrown away. There is no newsletter list, no endpoint and no
   * unsubscribe. A field that asks for an email address on a skin-health site
   * and then lies about what happened to it is a false statement to the user
   * (App Store Guideline 2.3.1) whichever way it is read. Nothing is lost by
   * taking it out: no code existed behind it. The footer.newsletter.* strings
   * are left in translations.ts so the 11-language key parity is untouched if
   * a real list is wired up later.
   */

  const navItems = [
    { href: "/", label: t('nav.home'), icon: Shield },
    { href: "/dashboard", label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: "/lab-analysis", label: t('lab.title'), icon: FlaskConical },
    { href: "/body-map", label: t('nav.bodyMap'), icon: MapPin },
    { href: "/capture", label: t('nav.capture'), icon: Camera },
    { href: "/health-report", label: t('nav.healthReport'), icon: FileText },
    // "/test-monitor" (Health Monitor) removed from the nav — see App.tsx: it is
    // fitness-app fork leftover (weight/BMI/hydration/sleep) seeded with fake
    // entries and storing nothing. Its route is gone, so a nav item would 404.
    { href: "/pricing", label: t('nav.pricing'), icon: CreditCard },
    { href: "/videos", label: t('nav.videos'), icon: Video },
    { href: "/faq", label: t('nav.faq'), icon: HelpCircle },
    { href: "/test", label: t('nav.testKnowledge'), icon: FlaskConical },
  ].filter((item) => !isNative || item.href !== "/pricing");

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      {/* safe-top: reserves the iOS status bar / Dynamic Island height inside the
          sticky header, so page content never runs under the clock. */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg safe-top">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <img
              src="/logo.png"
              alt="SkinGuard AI"
              className="w-10 h-10 object-contain"
            />
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100 hidden sm:inline">SkinGuard AI</span>
          </Link>

          {/* Desktop nav moved down into the animated-logo banner row (split
              left/right around the centered eye logo) — see below. */}

          {/* Auth + Mobile Toggle */}
          <div className="flex items-center gap-2">

            {isAuthenticated && user ? (
              <div className="hidden 2xl:flex items-center gap-2">
                <Link href="/user-dashboard" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden 2xl:flex items-center gap-2">
                <Link href="/login" className="no-underline">
                  <Button size="sm" variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/signup" className="no-underline">
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('nav.signUp')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Mobile Menu Toggle — only on small screens now (nav is visible md+) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={t('nav.menu')}
            >
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('nav.menu')}</span>
              {mobileOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border/60 bg-slate-50 dark:bg-slate-800"
          >
            <nav className="container py-4 flex flex-col gap-2">
              
              {/* MOBILE AUTH BUTTONS */}
              <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <Link href="/user-dashboard" className="flex items-center gap-2 no-underline" onClick={() => setMobileOpen(false)}>
                      <User className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={handleLogout} className="text-slate-600 dark:text-slate-400">
                      <LogOut className="w-4 h-4 mr-1" /> {t('nav.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" className="no-underline" onClick={() => setMobileOpen(false)}>
                      <button className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700">
                        <LogIn className="w-5 h-5" /> {t('nav.login')}
                      </button>
                    </Link>
                    <Link href="/signup" className="no-underline" onClick={() => setMobileOpen(false)}>
                      <button className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors shadow-sm">
                        <UserPlus className="w-5 h-5" /> {t('nav.signUp')}
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Nav items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href} className="no-underline">
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "text-cyan-600 bg-cyan-50"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  </Link>
                );
              })}
              <Link href="/legal" className="no-underline">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <FileText className="w-4 h-4" />
                  {t('nav.legalNotice')}
                </button>
              </Link>
              
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Logo Banner — desktop nav split left/right around the eye logo */}
      <div className="w-full border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 dark:from-slate-900 via-white dark:via-slate-900 to-slate-50 dark:to-slate-800">
        {/* xl+: nav items flank the centered eye logo, using the full width */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5">
          <nav className="flex flex-1 items-center justify-end gap-0.5">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="no-underline">
                  <button className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${isActive ? "text-cyan-600 bg-cyan-50" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>
          <LogoVideo src="/sglogoanim.mp4" className="h-14 w-auto object-contain pointer-events-none select-none shrink-0" />
          <nav className="flex flex-1 items-center justify-start gap-0.5">
            {navItems.slice(6).map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="no-underline">
                  <button className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${isActive ? "text-cyan-600 bg-cyan-50" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
        {/* md → 2xl: the eye logo + the FULL nav as a centered wrapping row (overflow
            wraps to a second line) — so the menu is always visible, never hidden. */}
        <div className="hidden md:flex 2xl:hidden flex-col items-center gap-1.5 py-2">
          <LogoVideo src="/sglogoanim.mp4" className="h-12 lg:h-14 w-auto object-contain pointer-events-none select-none" />
          <nav className="flex flex-wrap items-center justify-center gap-1 px-3 max-w-5xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="no-underline">
                  <button className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${isActive ? "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
        {/* below md (mobile): just the centered logo (nav in the "Menu" button) */}
        <div className="flex md:hidden justify-center items-center py-2">
          <LogoVideo src="/sglogoanim.mp4" className="h-16 w-auto object-contain pointer-events-none select-none" />
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* Footer - JAVÍTOTT VERZIÓ */}
      <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
        <div className="container">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About NOX Universe */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/cdn/YTSzalag_06e5e3e1.png"
                  alt="NOX UNIVERSE"
                  className="h-10"
                />
              </div>
              <h3 className="font-heading font-bold text-white mb-3">{t('footer.about.title')}</h3>
              <p className="text-sm text-slate-400 mb-4">
                {t('footer.about.description')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.links.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.home')}</Link></li>
                <li><Link href="/dashboard" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.dashboard')}</Link></li>
                {!isNative && <li><Link href="/pricing" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.pricing')}</Link></li>}
                <li><Link href="/test" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.testKnowledge')}</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.contact')}</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.about')}</Link></li>
                <li><Link href="/faq#sources" className="text-slate-400 hover:text-white no-underline transition-colors flex items-center gap-1"><BookOpen className="w-3 h-3" /> {t('footer.sources')}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.legal.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-slate-400 hover:text-white no-underline transition-colors">{t('footer.legal.privacy')}</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white no-underline transition-colors">{t('footer.legal.terms')}</Link></li>
                <li><Link href="/legal" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.legalNotice')}</Link></li>
                <li><Link href="/disclaimer" className="text-slate-400 hover:text-red-400 no-underline transition-colors flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {t('disclaimer.title')}</Link></li>
              </ul>
            </div>

            {/* The newsletter sign-up column stood here — removed, see the note
                where handleNewsletterSubmit used to be defined. */}
          </div>

          {/* Social Media & Contact Bar */}
          <div className="border-t border-slate-800 pt-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Social Links */}
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/share/g/1aSGhpR12p/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Facebook Group"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@skinguardai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@SkinGuardAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>

              {/* Contact Emails */}
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:info@skinguardai.app"
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t('footer.contact.email')}
                </a>
                <a
                  href="mailto:partners@skinguardai.app"
                  className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t('footer.contact.partnershipEmail')}
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 flex items-center justify-center gap-1">
              {t('footer.madeWith')} <Heart className="w-3 h-3 text-red-500" /> {t('footer.from')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}