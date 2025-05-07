import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";

import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import BattleZone from "@/pages/battle-zone";
import AiTools from "@/pages/ai-tools";
import Rewards from "@/pages/rewards";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import CreateProfile from "@/pages/create-profile";
import HomePage from "@/pages/home-page";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <Switch>
            <Route path="/" component={HomePage} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/courses" component={Courses} />
            <ProtectedRoute path="/battle-zone" component={BattleZone} />
            <ProtectedRoute path="/ai-tools" component={AiTools} />
            <ProtectedRoute path="/rewards" component={Rewards} />
            <ProtectedRoute path="/create-profile" component={CreateProfile} />
            <Route path="/auth" component={AuthPage} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
