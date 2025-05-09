import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { UserProvider } from "@/contexts/user-context";
import { RealTimeProvider } from "@/contexts/real-time-context";
import { ProtectedRoute } from "@/components/protected-route";

import Dashboard from "@/pages/dashboard";
import BattleZone from "@/pages/battle-zone";
import AiTools from "@/pages/ai-tools";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CreateProfile from "@/pages/create-profile";
import ProfileSettings from "@/pages/profile-settings";
import LeaderboardPage from "@/pages/leaderboard";
import HomePage from "./pages/home-page";
import WebSocketTest from "./pages/websocket-test";
import AiTutor from "./pages/ai-tutor";
import StudyNotesGenerator from "./pages/ai-tools/study-notes";
import AnswerChecker from "./pages/ai-tools/answer-checker";
import PerformanceAnalytics from "./pages/ai-tools/performance";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <RealTimeProvider>
              <Switch>
                <Route path="/" component={HomePage} />
                <ProtectedRoute path="/dashboard" component={Dashboard} />
                <ProtectedRoute path="/battle-zone" component={BattleZone} />
                <ProtectedRoute path="/ai-tools" component={AiTools} />
                <ProtectedRoute path="/ai-tools/study-notes" component={StudyNotesGenerator} />
                <ProtectedRoute path="/ai-tools/answer-checker" component={AnswerChecker} />
                <ProtectedRoute path="/ai-tools/performance" component={PerformanceAnalytics} />
                <ProtectedRoute path="/ai-tutor" component={AiTutor} />                 
                <ProtectedRoute path="/profile" component={ProfileSettings} />
                <ProtectedRoute path="/create-profile" component={CreateProfile} />
                <ProtectedRoute path="/websocket-test" component={WebSocketTest} />
                <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
                <Route path="/auth" component={AuthPage} />
                <Route component={NotFound} />
              </Switch>
              <Toaster />
            </RealTimeProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
