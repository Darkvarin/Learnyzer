import { Link, useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { Brain, Menu, X, ChevronDown, User, LogOut, Zap } from "lucide-react";
import { TrialStatusBadge } from "@/components/trial/trial-status-badge";
import { CoinDisplay } from "@/components/ui/coin-display";

export function Header() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [hoverEffect, setHoverEffect] = useState(false);

  // Determine active link based on current path using wouter
  const [location] = useLocation();
  useEffect(() => {
    if (location.includes("/dashboard")) setActiveLink("dashboard");
    else if (location.includes("/battle-zone")) setActiveLink("battle-zone");
    else if (location.includes("/ai-tutor")) setActiveLink("ai-tutor");
    else if (location.includes("/ai-tools")) setActiveLink("ai-tools");
    else if (location.includes("/leaderboard")) setActiveLink("leaderboard");
    else setActiveLink("");
  }, [location]);

  // Add scroll effect with proper window guard
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [, navigate] = useLocation();
  const { logoutMutation } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      // Redirect to homepage after logout
      navigate("/");
      // Force a page reload to ensure all components update their state
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  }, [logoutMutation, navigate, toast]);
  
  // Trigger hover effects periodically for ambient animation
  useEffect(() => {
    const interval = setInterval(() => {
      setHoverEffect(true);
      setTimeout(() => setHoverEffect(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl bg-black/80' : 'bg-black/70'} h-[70px]`}>
      {/* Simple elegant background */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-r from-black via-blue-950/30 to-black"></div>
      
      {/* Clean bottom border */}
      <div className="absolute inset-x-0 bottom-0 h-[2px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-500/80 to-blue-600/10"></div>
      </div>
      
      {/* Subtle top accent */}
      <div className="absolute inset-x-0 top-0 h-[1px]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-cyan-500/40 to-blue-600/0"></div>
      </div>
      
      {/* Minimal corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 opacity-60 pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-[2px] bg-cyan-500/70"></div>
        <div className="absolute top-0 left-0 w-[2px] h-8 bg-cyan-500/70"></div>
      </div>
      
      <div className="absolute top-0 right-0 w-12 h-12 opacity-60 pointer-events-none">
        <div className="absolute top-0 right-0 w-8 h-[2px] bg-cyan-500/70"></div>
        <div className="absolute top-0 right-0 w-[2px] h-8 bg-cyan-500/70"></div>
      </div>
      
      <div className={`container mx-auto ${isMobile ? 'px-2 py-2' : 'px-4 py-3'} h-full relative z-10 glassmorphism border-b border-primary/20`}>
        <div className="flex items-center justify-between h-full relative">
          {/* Decorative elements matching home page */}
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <div className="absolute -top-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4af3c0]/30 to-transparent"></div>
          {/* Professional Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center group">
              {/* Use the new professional logo SVG */}
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <div className="text-white text-lg font-bold">🧠</div>
                  </div>
                </div>
                <span 
                  className={`${isMobile ? 'text-lg' : 'text-xl'} font-black tracking-tight`}
                  style={{
                    background: "linear-gradient(90deg, #4f46e5, #7c3aed, #db2777, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Learnyzer
                </span>
              </div>
            </Link>
            {!isMobile && (
              <div className="flex items-center h-6 px-2 border border-[#4af3c0]/50 rounded-sm bg-[#0a2a42]/50">
                <span className="text-xs font-mono text-[#4af3c0] font-gaming">BETA</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <CoinDisplay compact={true} />
            <TrialStatusBadge variant="compact" showTimeLeft={false} />            
            {!isMobile && (
              <nav className="flex items-center space-x-1">
                <NavLink 
                  href="/dashboard" 
                  active={activeLink === "dashboard"} 
                  setActive={() => setActiveLink("dashboard")}
                >
                  Dashboard
                </NavLink>
                <NavLink 
                  href="/battle-zone" 
                  active={activeLink === "battle-zone"}
                  setActive={() => setActiveLink("battle-zone")}
                >
                  Battle Zone
                </NavLink>
                <NavLink 
                  href="/ai-tutor" 
                  active={activeLink === "ai-tutor"}
                  setActive={() => setActiveLink("ai-tutor")}
                >
                  AI Tutor
                </NavLink>
                <NavLink 
                  href="/ai-tools" 
                  active={activeLink === "ai-tools"}
                  setActive={() => setActiveLink("ai-tools")}
                >
                  AI Tools
                </NavLink>
                <NavLink 
                  href="/leaderboard" 
                  active={activeLink === "leaderboard"}
                  setActive={() => setActiveLink("leaderboard")}
                >
                  Leaderboard
                </NavLink>
              </nav>
            )}
            
            {/* Simple elegant user avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center space-x-2 group ${isMobile ? 'p-2' : ''}`}>
                <div className={`relative ${isMobile ? 'w-8 h-8' : 'w-9 h-9'}`}>
                  {/* Simple avatar frame */}
                  <div className="absolute inset-0 rounded-full overflow-hidden border border-[#47c1d6]/60 bg-[#0a2a42]">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name || "Profile"} 
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-bold text-[#4af3c0]`}>
                          {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!isMobile && (
                  <>
                    <span className="text-sm font-medium text-white font-gaming group-hover:text-[#4af3c0] transition-colors">{user?.name || "User"}</span>
                    <ChevronDown className="h-4 w-4 text-[#47c1d6] group-hover:text-white transition-colors" />
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`bg-[#0a2a42]/90 backdrop-blur-xl border border-[#47c1d6]/40 ${isMobile ? 'w-64 mr-2' : ''}`}>
                <DropdownMenuLabel className="text-[#47c1d6] font-gaming">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#4af3c0]" />
                    <span>My Account</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-[#47c1d6]/30 to-transparent h-px" />
                <DropdownMenuItem asChild className="hover:bg-[#47c1d6]/10 text-white/90 transition-colors">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2 text-[#4af3c0]" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem asChild className="hover:bg-[#47c1d6]/10 text-white/90 transition-colors">
                    <Link href="/lead-generation" className="flex items-center w-full">
                      <Brain className="h-4 w-4 mr-2 text-[#4af3c0]" />
                      Lead Management
                      <span className="ml-auto bg-red-600 text-white px-2 py-0.5 rounded text-xs">Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-[#47c1d6]/30 to-transparent h-px" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-[#4af3c0]/10 text-white/90 transition-colors">
                  <LogOut className="h-4 w-4 mr-2 text-[#4af3c0]" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

// Simple elegant NavLink
function NavLink({ 
  href, 
  children, 
  active, 
  setActive 
}: { 
  href: string; 
  children: React.ReactNode; 
  active: boolean;
  setActive: () => void;
}) {
  return (
    <Link 
      href={href} 
      onClick={setActive}
      className={`relative px-3 py-2 mx-2 group ${
        active ? 'text-[#4af3c0]' : 'text-white hover:text-[#47c1d6]'
      } transition-all font-gaming overflow-hidden`}
    >
      {/* Background hover effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-md"></span>
      
      {/* Text content */}
      <span className="font-gaming tracking-wide text-sm transition-colors duration-200 relative z-10">
        {children}
      </span>
      
      {/* Active state elegant border */}
      <div className={`absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#4af3c0] to-transparent transition-all duration-300 ${
        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
      }`}></div>
      
      {/* Subtle top indicator for active state */}
      {active && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#4af3c0]/40 to-transparent"></div>
      )}
    </Link>
  );
}
