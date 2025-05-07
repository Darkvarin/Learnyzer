import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/contexts/user-context";
import { queryClient } from "./lib/queryClient";

import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import BattleZone from "@/pages/battle-zone";
import AiTools from "@/pages/ai-tools";
import Rewards from "@/pages/rewards";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <UserProvider>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/courses" component={Courses} />
            <Route path="/battle-zone" component={BattleZone} />
            <Route path="/ai-tools" component={AiTools} />
            <Route path="/rewards" component={Rewards} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
