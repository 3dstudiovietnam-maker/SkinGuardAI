import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import { SkinStoreProvider } from "./contexts/SkinStore";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";

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
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
      <Switch>
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
