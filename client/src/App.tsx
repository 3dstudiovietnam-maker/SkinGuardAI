import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SkinStoreProvider } from "./contexts/SkinStore";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import BodyMap from "./pages/BodyMap";
import Capture from "./pages/Capture";
import MoleDetail from "./pages/MoleDetail";
import Comparison from "./pages/Comparison";
import Pricing from "./pages/Pricing";
import HealthReport from "./pages/HealthReport";
import TestMonitor from "./pages/TestMonitor";
import Legal from "./pages/Legal";
import Contact from "./pages/Contact";
import Videos from "./pages/Videos";
import FAQ from "./pages/FAQ";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserDashboard from "./pages/UserDashboard";
import Layout from "./components/Layout";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/dashboard"} component={Dashboard} />
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
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <SkinStoreProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </SkinStoreProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
