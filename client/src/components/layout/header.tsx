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

  // Determine active link based on current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/dashboard")) setActiveLink("dashboard");
    else if (path.includes("/courses")) setActiveLink("courses");
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md' : 'bg-transparent'} h-[70px]`}>
      {/* Solo Leveling Background Elements */}
      <div className="absolute inset-0 z-[-1] bg-background/60 backdrop-blur-sm"></div>
      {isScrolled && (
        <div className="absolute inset-0 z-[-1] border-b border-cyan-500/30"></div>
      )}
      
      {/* Scan line effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] solo-scan-line"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

      {/* Solo Leveling corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 z-10 pointer-events-none">
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-500/30"></div>
      </div>
      <div className="absolute top-0 right-0 w-16 h-16 z-10 pointer-events-none">
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary/30"></div>
      </div>
      
      <div className="container mx-auto px-4 py-3 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo with Solo Leveling styling */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center">
              <div className="relative w-10 h-10 mr-2">
                {/* Solo Leveling energy ring */}
                <div className="absolute inset-0 monarch-insignia opacity-70"></div>
                
                {/* Logo icon with Solo Leveling frame */}
                <div className="absolute inset-0 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500/50 via-primary/40 to-cyan-500/50 p-0.5">
                  <div className="absolute inset-0.5 bg-background/90 rounded-md flex items-center justify-center">
                    <Brain className="h-5 w-5 text-cyan-400 shadow-glow" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <span className="text-2xl font-gaming tracking-wide text-glow">
                  <span className="gradient-text font-bold text-3xl" style={{
                    background: "linear-gradient(90deg, #06b6d4, #7d27ff, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% auto",
                    animation: "gradient-animation 5s linear infinite",
                    textShadow: "0 0 10px rgba(125, 39, 255, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)"
                  }}>LearnityX</span>
                </span>
                
                {/* Solo Leveling style underline */}
                <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/30 via-primary/70 to-cyan-500/30"></div>
              </div>
            </Link>
            <div className="flex items-center h-5 px-2 border border-cyan-500/40 rounded-sm relative">
              <span className="text-xs font-mono text-cyan-400 animate-pulse font-gaming">BETA</span>
              {/* Solo Leveling corner accents */}
              <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyan-500/60"></div>
              <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-cyan-500/60"></div>
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
                  href="/courses" 
                  active={activeLink === "courses"}
                  setActive={() => setActiveLink("courses")}
                >
                  Courses
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
              </nav>
            )}
            
            {/* User avatar with Solo Leveling styling */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 group">
                <div className="relative w-9 h-9">
                  {/* Solo Leveling energy ring */}
                  <div className="absolute inset-0 monarch-insignia opacity-60"></div>
                  
                  {/* User avatar with Solo Leveling frame */}
                  <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500/50 via-primary/40 to-cyan-500/50 p-0.5">
                    <div className="bg-background/90 w-full h-full rounded-full flex items-center justify-center relative z-10 overflow-hidden">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name || "Profile"} 
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-cyan-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-cyan-400">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <>
                    <span className="text-sm font-medium text-white font-gaming">{user?.name || "User"}</span>
                    <ChevronDown className="h-4 w-4 text-cyan-400 group-hover:text-white transition-colors" />
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 border border-cyan-500/30">
                <DropdownMenuLabel className="text-cyan-100 font-gaming">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    My Account
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cyan-500/20" />
                <DropdownMenuItem asChild className="hover:bg-cyan-500/10 text-white/90">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2 text-cyan-400" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-500/20" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-primary/10 text-white/90">
                  <LogOut className="h-4 w-4 mr-2 text-primary/90" />
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

// Custom navigation link with Solo Leveling styling
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
      className={`relative px-4 py-2 mx-1 group overflow-hidden ${active ? 'text-white' : 'text-gray-300/80 hover:text-white/90'} transition-colors`}
    >
      {/* Text content */}
      <span className="relative z-10 font-gaming text-sm">{children}</span>
      
      {/* Active state background with Solo Leveling style */}
      {active && (
        <div className="absolute inset-0 bg-cyan-500/10 rounded-md overflow-hidden">
          {/* Solo Leveling corner accents for active link */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/60"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/60"></div>
          
          {/* Active pulse effect */}
          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
        </div>
      )}
      
      {/* Hover and active indicator line with glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] flex justify-center">
        <div 
          className={`h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform transition-all duration-300 ${
            active ? 'w-full opacity-70' : 'w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-40'
          }`}
        ></div>
      </div>
    </Link>
  );
}
