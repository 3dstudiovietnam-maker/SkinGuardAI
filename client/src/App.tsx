import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import { SkinStoreProvider } from "./contexts/SkinStore";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Lazy-loaded routes — split heavy pages (charts, PDF, camera, AI) out of the
// initial bundle so the landing page loads fast. Loaded on demand per route.
const LabAnalysis = lazy(() => import("./pages/LabAnalysis"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BodyMap = lazy(() => import("./pages/BodyMap"));
const Capture = lazy(() => import("./pages/Capture"));
const MoleDetail = lazy(() => import("./pages/MoleDetail"));
const Comparison = lazy(() => import("./pages/Comparison"));
const Pricing = lazy(() => import("./pages/Pricing"));
const HealthReport = lazy(() => import("./pages/HealthReport"));
const TestMonitor = lazy(() => import("./pages/TestMonitor"));
const Legal = lazy(() => import("./pages/Legal"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Videos = lazy(() => import("./pages/Videos"));
const FAQ = lazy(() => import("./pages/FAQ"));
const SignUp = lazy(() => import("./pages/SignUp"));
const LogIn = lazy(() => import("./pages/LogIn"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const About = lazy(() => import("./pages/About"));
const TestPage = lazy(() => import("./pages/TestPage"));
const TestCapture = lazy(() => import("./pages/TestCapture"));
const TestKnowledge = lazy(() => import("./pages/TestKnowledge"));
const TestDoctors = lazy(() => import("./pages/TestDoctors"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  // Per-route canonical URL (SPA has no SSR, so update the <link rel=canonical>
  // on each navigation instead of the single static root canonical in index.html).
  useEffect(() => {
    const href = "https://www.skinguardai.app" + (location === "/" ? "" : location);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.setAttribute("href", href);
  }, [location]);
  const reduce = useReducedMotion();
  // Gentle fade+slide page transition on navigation. Respects prefers-reduced-motion
  // (drops movement to an instant swap — important for motion-sensitive users).
  const variants = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };
  return (
    <Layout>
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.div key={location} variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}>
          <Suspense fallback={<RouteFallback />}>
          <Switch location={location}>
        <Route path={"/"} component={Home} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/lab-analysis"} component={LabAnalysis} />
        <Route path={"/body-map"} component={BodyMap} />
        <Route path={"/capture"} component={Capture} />
        <Route path={"/capture/:region"} component={Capture} />
        <Route path={"/mole/:id"} component={MoleDetail} />
        <Route path={"/comparison/:id"} component={Comparison} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/health-report"} component={HealthReport} />
        <Route path={"/test-monitor"} component={TestMonitor} />
        <Route path={"/legal"} component={Legal} />
        <Route path={"/privacy"} component={Privacy} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/videos"} component={Videos} />
        <Route path={"/faq"} component={FAQ} />
        <Route path={"/signup"} component={SignUp} />
        <Route path={"/login"} component={LogIn} />
        <Route path={"/forgot-password"} component={ForgotPassword} />
        <Route path={"/reset-password"} component={ResetPassword} />
        <Route path={"/user-dashboard"} component={UserDashboard} />
        <Route path={"/about"} component={About} />
        <Route path={"/test"} component={TestPage} />
        <Route path={"/test/capture"} component={TestCapture} />
        <Route path={"/test/knowledge"} component={TestKnowledge} />
        <Route path={"/test/doctors"} component={TestDoctors} />
        <Route path={"/disclaimer"} component={Disclaimer} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
          </Switch>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <LanguageProvider>
          <SkinStoreProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <ThemeToggle />
            </TooltipProvider>
          </SkinStoreProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
