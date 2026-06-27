/*
 * Bright teal navigation, clean white background, professional typography
 */
import { Link, useLocation, useRoute } from "wouter";
import LogoVideo from "@/components/LogoVideo";
import { Shield, LayoutDashboard, User, Camera, MapPin, CreditCard, Menu, X, LogIn, LogOut, FileText, TrendingUp, Facebook, Mail, UserPlus, Video, HelpCircle, Phone, Github, Twitter, Instagram, Linkedin, Youtube, Send, Heart, Info, FlaskConical, BookOpen, AlertTriangle } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { user, isAuthenticated, logout: authLogout } = useAuth();
  const { logout: storeLogout } = useSkinStore();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await authLogout();
    } catch {
      // ha hiba volt, akkor is kiléptetjük
    }
    storeLogout();
    window.location.href = "/";
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    
    setNewsletterStatus("loading");
    try {
      // Itt jön majd a newsletter API hívás
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewsletterStatus("success");
      setEmail("");
      setTimeout(() => setNewsletterStatus("idle"), 3000);
    } catch {
      setNewsletterStatus("error");
      setTimeout(() => setNewsletterStatus("idle"), 3000);
    }
  };

  const navItems = [
    { href: "/", label: t('nav.home'), icon: Shield },
    { href: "/dashboard", label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: "/lab-analysis", label: t('lab.title'), icon: FlaskConical },
    { href: "/body-map", label: t('nav.bodyMap'), icon: MapPin },
    { href: "/capture", label: t('nav.capture'), icon: Camera },
    { href: "/health-report", label: t('nav.healthReport'), icon: FileText },
    { href: "/test-monitor", label: t('nav.monitor'), icon: TrendingUp },
    { href: "/pricing", label: t('nav.pricing'), icon: CreditCard },
    { href: "/videos", label: t('nav.videos'), icon: Video },
    { href: "/faq", label: t('nav.faq'), icon: HelpCircle },
    { href: "/test", label: t('nav.testKnowledge'), icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663394168688/jYIrjqasovImfira.png"
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
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="2xl:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
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
            className="2xl:hidden border-b border-border/60 bg-slate-50 dark:bg-slate-800"
          >
            <nav className="container py-4 flex flex-col gap-2">
              
              {/* MOBILE AUTH BUTTONS */}
              <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                    </div>
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
        {/* below xl: just the centered logo (nav lives in the hamburger menu) */}
        <div className="flex 2xl:hidden justify-center items-center py-2">
          <LogoVideo src="/sglogoanim.mp4" className="h-16 md:h-20 w-auto object-contain pointer-events-none select-none" />
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* Footer - JAVÍTOTT VERZIÓ */}
      <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
        <div className="container">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About NOX Universe */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663394168688/kZ49tdkVmLHcu3Y3TSHN32/YTSzalag_06e5e3e1.png"
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
                <li><Link href="/pricing" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.pricing')}</Link></li>
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
                <li><Link href="/legal" className="text-slate-400 hover:text-white no-underline transition-colors">{t('footer.legal.privacy')}</Link></li>
                <li><Link href="/legal" className="text-slate-400 hover:text-white no-underline transition-colors">{t('footer.legal.terms')}</Link></li>
                <li><Link href="/legal" className="text-slate-400 hover:text-white no-underline transition-colors">{t('nav.legalNotice')}</Link></li>
                <li><Link href="/disclaimer" className="text-slate-400 hover:text-red-400 no-underline transition-colors flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {t('disclaimer.title')}</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-white mb-4">{t('footer.newsletter.title')}</h4>
              <p className="text-sm text-slate-400 mb-4">
                {t('footer.newsletter.subtitle')}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.newsletter.emailPlaceholder')}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={newsletterStatus === "loading"}
                  />
                  <Button
                    type="submit"
                    disabled={newsletterStatus === "loading"}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6"
                  >
                    {newsletterStatus === "loading" ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t('footer.newsletter.sending')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        {t('footer.newsletter.button')}
                      </span>
                    )}
                  </Button>
                </div>
                {newsletterStatus === "success" && (
                  <p className="text-sm text-green-400">{t('footer.newsletter.success')}</p>
                )}
                {newsletterStatus === "error" && (
                  <p className="text-sm text-red-400">{t('footer.newsletter.error')}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('footer.newsletter.privacy')}
                </p>
              </form>
            </div>
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