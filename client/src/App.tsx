import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { UserProvider } from "@/contexts/user-context";
import { RealTimeProvider } from "@/contexts/real-time-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/scroll-to-top";


import Dashboard from "@/pages/dashboard";
import BattleZone from "@/pages/battle-zone";
import AiTools from "@/pages/ai-tools";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CreateProfile from "@/pages/create-profile";
import ProfileSettings from "@/pages/profile-settings";
import LeaderboardPage from "@/pages/leaderboard";
import HomePage from "./pages/home-page";
import AiTutor from "./pages/ai-tutor";
import StudyNotesGenerator from "./pages/ai-tools/study-notes";
import AnswerChecker from "./pages/ai-tools/answer-checker";
import MockTestGenerator from "./pages/ai-tools/mock-test-generator";
import PerformanceAnalytics from "./pages/ai-tools/performance";
import AIVisualLab from "./pages/ai-visual-lab";
import SecurityDashboard from "./pages/security-dashboard";
import LeadGeneration from "./pages/lead-generation";
import CustomerFeedback from "./pages/customer-feedback";
import SubscriptionPage from "./pages/subscription";
import TermsPage from "./pages/terms";
import PrivacyPage from "./pages/privacy";
import ContactPage from "./pages/contact";
import LandingPage from "./pages/landing-page";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <RealTimeProvider>
              <div className="min-h-screen flex flex-col cyber-scrollbar">
                <ScrollToTop />
                <main className="flex-1">
                  <Switch>
                    <Route path="/" component={HomePage} />
                    <Route path="/landing" component={LandingPage} />
                    <ProtectedRoute path="/dashboard" component={Dashboard} />
                    <ProtectedRoute path="/battle-zone" component={BattleZone} />
                    <ProtectedRoute path="/ai-tools" component={AiTools} />
                    <ProtectedRoute path="/ai-tools/study-notes" component={StudyNotesGenerator} />
                    <ProtectedRoute path="/ai-tools/answer-checker" component={AnswerChecker} />
                    <ProtectedRoute path="/ai-tools/mock-test-generator" component={MockTestGenerator} />
                    <ProtectedRoute path="/ai-tools/performance" component={PerformanceAnalytics} />
                    <ProtectedRoute path="/ai-tutor" component={AiTutor} />
                    <ProtectedRoute path="/ai-visual-lab" component={AIVisualLab} />
                    <ProtectedRoute path="/subscription" component={SubscriptionPage} />
                    <ProtectedRoute path="/security-dashboard" component={SecurityDashboard} />
                    <ProtectedRoute path="/lead-generation" component={LeadGeneration} />
                    <Route path="/feedback" component={CustomerFeedback} />
                    <Route path="/terms" component={TermsPage} />
                    <Route path="/privacy" component={PrivacyPage} />
                    <Route path="/contact" component={ContactPage} />
                    <ProtectedRoute path="/profile" component={ProfileSettings} />
                    <ProtectedRoute path="/create-profile" component={CreateProfile} />
                    <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
                    <Route path="/auth" component={AuthPage} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
                <Footer />
              </div>
              <Toaster />
            </RealTimeProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
