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

export function Header() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [hoverEffect, setHoverEffect] = useState(false);

  // Determine active link based on current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/dashboard")) setActiveLink("dashboard");
    else if (path.includes("/battle-zone")) setActiveLink("battle-zone");
    else if (path.includes("/ai-tutor")) setActiveLink("ai-tutor");
    else if (path.includes("/ai-tools")) setActiveLink("ai-tools");
    else setActiveLink("");
  }, []);

  // Add scroll effect
  useEffect(() => {
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
      window.location.reload();
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
      
      <div className="container mx-auto px-4 py-3 h-full relative z-10 before:absolute before:inset-0 before:rounded-b-xl before:bg-gradient-to-r before:from-blue-900/20 before:to-cyan-900/20 before:backdrop-blur-sm before:-z-10 before:border-b before:border-cyan-500/30">
        <div className="flex items-center justify-between h-full relative">
          {/* Decorative elements */}
          <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          <div className="absolute -top-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          {/* Elegant Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center">
              <div className="relative w-10 h-10 mr-3 flex items-center justify-center overflow-hidden">
                {/* Logo background with glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-cyan-900/30 rounded-full border border-cyan-500/50 glow-border"></div>
                
                {/* Learnyzer Logo */}
                <img 
                  src="/images/learnyzer-logo.png" 
                  alt="Learnyzer Logo" 
                  className="w-9 h-9 object-contain relative z-10"
                />
              </div>
              <div className="relative">
                <span className="text-2xl font-gaming tracking-wide">
                  <span className="gradient-text font-bold text-3xl" style={{
                    background: "linear-gradient(90deg, #0ea5e9, #7c3aed)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 5px rgba(14, 165, 233, 0.3)"
                  }}>Learnyzer</span>
                </span>
                
                {/* Simple elegant underline */}
                <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent"></div>
              </div>
            </Link>
            <div className="flex items-center h-6 px-2 border border-cyan-500/50 rounded-sm">
              <span className="text-xs font-mono text-cyan-400 font-gaming">BETA</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">            
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
              <DropdownMenuTrigger className="flex items-center space-x-2 group">
                <div className="relative w-9 h-9">
                  {/* Simple avatar frame */}
                  <div className="absolute inset-0 rounded-full overflow-hidden border border-cyan-500/60 bg-gradient-to-br from-blue-900/30 to-cyan-900/20">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name || "Profile"} 
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-bold text-cyan-400">
                          {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!isMobile && (
                  <>
                    <span className="text-sm font-medium text-white font-gaming group-hover:text-cyan-400 transition-colors">{user?.name || "User"}</span>
                    <ChevronDown className="h-4 w-4 text-cyan-500 group-hover:text-white transition-colors" />
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border border-cyan-500/40">
                <DropdownMenuLabel className="text-cyan-100 font-gaming">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <span>My Account</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent h-[1px]" />
                <DropdownMenuItem asChild className="hover:bg-cyan-500/10 text-white/90 transition-colors">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2 text-cyan-400" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent h-[1px]" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-blue-500/10 text-white/90 transition-colors">
                  <LogOut className="h-4 w-4 mr-2 text-blue-400" />
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
      className={`relative px-4 py-2 mx-2 group ${
        active ? 'text-white' : 'text-cyan-300/90 hover:text-white'
      }`}
    >
      {/* Text content */}
      <span className="font-gaming tracking-wide text-sm transition-colors duration-200">
        {children}
      </span>
      
      {/* Active state elegant border */}
      <div className={`absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-300 ${
        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
      }`}></div>
      
      {/* Subtle top indicator for active state */}
      {active && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
      )}
    </Link>
  );
}
