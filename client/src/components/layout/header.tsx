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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl' : 'bg-transparent'} h-[70px]`}>
      {/* Enhanced Cyberpunk Background Elements */}
      <div className="absolute inset-0 z-[-1] bg-black/80 backdrop-blur-lg"></div>
      {isScrolled && (
        <div className="absolute inset-0 z-[-1] border-b-2 border-cyan-500/40 shadow-[0_4px_12px_-5px_rgba(14,165,233,0.5)]"></div>
      )}
      
      {/* Enhanced Scan line effects */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-800/50 via-cyan-500/70 to-blue-800/50"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-800/50 via-cyan-500/70 to-blue-800/50"></div>

      {/* Digital circuit patterns */}
      <div className="absolute inset-0 cyber-data-pattern opacity-10 z-[-1]"></div>
      
      {/* Enhanced Cyberpunk corner decorations */}
      <div className="absolute top-0 left-0 w-20 h-20 z-10 pointer-events-none">
        <div className="absolute top-2 left-2 w-10 h-10" style={{
          clipPath: "polygon(0 0, 100% 0, 100% 20%, 20% 20%, 20% 100%, 0 100%)",
          border: "2px solid rgba(14, 165, 233, 0.5)",
          borderRadius: "2px",
          boxShadow: "0 0 8px rgba(14, 165, 233, 0.3)"
        }}></div>
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 z-10 pointer-events-none">
        <div className="absolute top-2 right-2 w-10 h-10" style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 80% 100%, 80% 20%, 0 20%)",
          border: "2px solid rgba(14, 165, 233, 0.5)",
          borderRadius: "2px",
          boxShadow: "0 0 8px rgba(14, 165, 233, 0.3)"
        }}></div>
      </div>
      
      {/* Energy Node Points */}
      <div className="absolute top-2 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-500/80 animate-glow-pulse"></div>
      <div className="absolute top-2 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-500/80 animate-glow-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="container mx-auto px-4 py-3 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo with Enhanced Cyberpunk styling */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center">
              <div className="relative w-10 h-10 mr-2">
                {/* Tech circuit pattern background */}
                <div className="absolute inset-0 cyber-data-pattern opacity-50 rounded-lg"></div>
                
                {/* Digital energy nodes */}
                <div className="absolute w-1 h-1 top-1 right-1 rounded-full bg-cyan-500 animate-glow-pulse"></div>
                <div className="absolute w-1 h-1 bottom-1 left-1 rounded-full bg-blue-500 animate-glow-pulse" style={{animationDelay: '0.7s'}}></div>
                
                {/* Enhanced logo frame with digital circuit border */}
                <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-cyan-500/70 shadow-[0_0_10px_rgba(14,165,233,0.4)] p-0.5">
                  <div className="absolute inset-0.5 bg-black/90 rounded-md flex items-center justify-center overflow-hidden">
                    {/* Glowing circuit background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/20"></div>
                    
                    {/* Logo icon */}
                    <Brain className="h-5 w-5 text-cyan-400 relative z-10 animate-slow-pulse" style={{filter: "drop-shadow(0 0 5px rgba(14, 165, 233, 0.7))"}} />
                  </div>
                </div>
              </div>
              <div className="relative">
                <span className="text-2xl font-gaming tracking-wide">
                  <span className="gradient-text font-bold text-3xl" style={{
                    background: "linear-gradient(90deg, #0ea5e9, #7c3aed, #0ea5e9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% auto",
                    animation: "gradient-animation 5s linear infinite",
                    textShadow: "0 0 10px rgba(14, 165, 233, 0.7), 0 0 15px rgba(124, 58, 237, 0.5)",
                    filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))"
                  }}>LearnityX</span>
                </span>
                
                {/* Enhanced digital underline effect */}
                <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-800/50 via-cyan-500/80 to-blue-800/50"></div>
                <div className="absolute -bottom-3 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              </div>
            </Link>
            <div className="flex items-center h-6 px-2 border-2 border-cyan-500/60 rounded relative shadow-[0_0_5px_rgba(14,165,233,0.3)]">
              <span className="text-xs font-mono text-cyan-400 animate-pulse font-gaming">BETA</span>
              {/* Enhanced corner accents */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5" style={{
                clipPath: "polygon(0 0, 100% 0, 0 100%)",
                background: "rgba(14, 165, 233, 0.5)"
              }}></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5" style={{
                clipPath: "polygon(100% 100%, 0 100%, 100% 0)",
                background: "rgba(14, 165, 233, 0.5)"
              }}></div>
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
            
            {/* User avatar with Enhanced Cyberpunk styling */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 group">
                <div className="relative w-9 h-9">
                  {/* Tech circuit background */}
                  <div className="absolute inset-0 cyber-data-pattern opacity-30 rounded-full"></div>
                  
                  {/* Digital hexagon frame */}
                  <div className="absolute inset-0 bg-cyan-900/20 rounded-full" style={{
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    transform: "scale(0.95)",
                    opacity: "0.7"
                  }}></div>
                  
                  {/* Digital glowing nodes */}
                  <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-cyan-500/80 animate-glow-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-blue-500/80 animate-glow-pulse" style={{animationDelay: '0.8s'}}></div>
                  
                  {/* Enhanced avatar frame with digital border */}
                  <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-cyan-500/70 shadow-[0_0_8px_rgba(14,165,233,0.4)] p-0.5">
                    <div className="absolute inset-0.5 bg-black/90 rounded-full flex items-center justify-center relative z-10 overflow-hidden">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name || "Profile"} 
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-cyan-900/30 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-cyan-900/30">
                          <span className="text-xs font-bold text-cyan-400" style={{
                            textShadow: "0 0 5px rgba(14, 165, 233, 0.7)"
                          }}>
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <>
                    <span className="text-sm font-medium text-white font-gaming group-hover:text-cyan-400 transition-colors">{user?.name || "User"}</span>
                    <ChevronDown className="h-4 w-4 text-cyan-500 group-hover:text-white transition-colors" />
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-2 border-cyan-500/40 shadow-[0_5px_15px_rgba(14,165,233,0.3)]">
                <DropdownMenuLabel className="text-cyan-100 font-gaming">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" style={{filter: "drop-shadow(0 0 2px rgba(14, 165, 233, 0.7))"}} />
                    <span style={{textShadow: "0 0 5px rgba(14, 165, 233, 0.5)"}}>My Account</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent h-[2px]" />
                <DropdownMenuItem asChild className="hover:bg-cyan-500/10 text-white/90 transition-colors">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2 text-cyan-400" style={{filter: "drop-shadow(0 0 2px rgba(14, 165, 233, 0.7))"}} />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent h-[2px]" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-blue-500/10 text-white/90 transition-colors">
                  <LogOut className="h-4 w-4 mr-2 text-blue-400" style={{filter: "drop-shadow(0 0 2px rgba(59, 130, 246, 0.7))"}} />
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

// Custom navigation link with Enhanced Cyberpunk styling
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
      className={`relative px-4 py-2 mx-1 group overflow-hidden ${active ? 'text-white' : 'text-cyan-300/70 hover:text-white'} transition-colors`}
    >
      {/* Text content */}
      <span className="relative z-10 font-gaming text-sm" style={{
        textShadow: active ? "0 0 5px rgba(14, 165, 233, 0.7)" : "none",
        letterSpacing: "0.5px"
      }}>{children}</span>
      
      {/* Active state background with Enhanced Cyberpunk styling */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/50 to-blue-900/40 rounded-md overflow-hidden border border-cyan-500/40 shadow-[0_0_8px_rgba(14,165,233,0.3)]">
          {/* Digital circuit corners */}
          <div className="absolute top-0 left-0 w-2 h-2" style={{
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            background: "rgba(14, 165, 233, 0.5)"
          }}></div>
          <div className="absolute bottom-0 right-0 w-2 h-2" style={{
            clipPath: "polygon(100% 100%, 0 100%, 100% 0)",
            background: "rgba(14, 165, 233, 0.5)"
          }}></div>
          
          {/* Digital energy nodes */}
          <div className="absolute top-1 right-2 w-1 h-1 rounded-full bg-cyan-500/80 animate-glow-pulse"></div>
          <div className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-blue-500/80 animate-glow-pulse" style={{animationDelay: '0.8s'}}></div>
          
          {/* Cyberpunk circuit pattern */}
          <div className="absolute inset-0 cyber-data-pattern opacity-10"></div>
        </div>
      )}
      
      {/* Enhanced hover effect - glowing circuit border */}
      <div className="absolute -bottom-[1px] left-0 right-0">
        <div className={`h-[2px] bg-gradient-to-r from-cyan-900/60 via-cyan-500/80 to-cyan-900/60 transform transition-all duration-300 ${
          active ? 'w-full shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'w-0 group-hover:w-full'
        }`}></div>
      </div>
      
      {/* Top accent line on hover */}
      <div className="absolute -top-[1px] left-1/4 right-1/4">
        <div className={`h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent transform transition-all duration-300 ${
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}></div>
      </div>
      
      {/* Digital readout line on hover */}
      <div className="absolute top-0 bottom-0 right-0 w-[1px]">
        <div className={`h-full bg-gradient-to-b from-cyan-900/0 via-cyan-500/40 to-cyan-900/0 transform transition-all duration-300 ${
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}></div>
      </div>
    </Link>
  );
}
