import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/types";
import { useAuth } from "@/hooks/use-auth";

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  
  // Use the authenticated user from auth context
  const { user: authUser, isLoading } = useAuth();
  
  // Update user state when auth user changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser as unknown as User);
    } else {
      setUser(null);
    }
  }, [authUser]);

  // Auto-refresh user data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  
  return context;
}
