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
  
  // Trigger hover effects periodically for ambient animation
  useEffect(() => {
    const interval = setInterval(() => {
      setHoverEffect(true);
      setTimeout(() => setHoverEffect(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl' : ''} h-[80px]`}>
      {/* Holographic Background */}
      <div className="absolute inset-0 z-[-2] bg-gradient-to-r from-black via-blue-950/90 to-black"></div>
      
      {/* Active Scan Effect - Horizontal Line */}
      <div 
        className="absolute h-[2px] z-[-1] left-0 right-0" 
        style={{
          top: `${Math.sin(Date.now() / 2000) * 30 + 35}px`,
          background: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.8), transparent)',
          boxShadow: '0 0 20px 5px rgba(14, 165, 233, 0.5)',
          opacity: 0.7
        }}
      ></div>
      
      {/* Animated Cyber Grid */}
      <div className="absolute inset-0 z-[-1] cyber-circuit-pattern opacity-20 animate-data-stream"></div>
      
      {/* Digital Noise Overlay */}
      <div className="absolute inset-0 z-[-1] bg-noise opacity-5"></div>
      
      {/* Glowing Border when scrolled */}
      {isScrolled && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-cyan-500 to-blue-600/0 animate-digital-pulse"></div>
          <div className="absolute inset-0 blur-[8px] bg-gradient-to-r from-blue-600/0 via-cyan-400 to-blue-600/0 animate-digital-pulse"></div>
        </div>
      )}
      
      {/* Vibrant Corner Decorations */}
      <div className="absolute top-0 left-0 w-24 h-24 opacity-70 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L60 0L60 6L6 6L6 60L0 60L0 0Z" fill="rgba(14, 165, 233, 0.8)" className="animate-cyber-flicker"/>
          <path d="M0 0L40 0L40 3L3 3L3 40L0 40L0 0Z" fill="rgba(124, 58, 237, 0.8)" className="animate-cyber-flicker" style={{animationDelay: '0.5s'}}/>
          <circle cx="70" cy="10" r="2" fill="rgba(14, 165, 233, 0.9)" className="animate-glow-pulse"/>
          <circle cx="80" cy="20" r="1.5" fill="rgba(124, 58, 237, 0.9)" className="animate-glow-pulse" style={{animationDelay: '0.7s'}}/>
        </svg>
      </div>
      
      <div className="absolute top-0 right-0 w-24 h-24 opacity-70 pointer-events-none">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 0L40 0L40 6L94 6L94 60L100 60L100 0Z" fill="rgba(14, 165, 233, 0.8)" className="animate-cyber-flicker"/>
          <path d="M100 0L60 0L60 3L97 3L97 40L100 40L100 0Z" fill="rgba(124, 58, 237, 0.8)" className="animate-cyber-flicker" style={{animationDelay: '0.5s'}}/>
          <circle cx="30" cy="10" r="2" fill="rgba(14, 165, 233, 0.9)" className="animate-glow-pulse"/>
          <circle cx="20" cy="20" r="1.5" fill="rgba(124, 58, 237, 0.9)" className="animate-glow-pulse" style={{animationDelay: '0.7s'}}/>
        </svg>
      </div>
      
      {/* Digital Data Nodes along edges */}
      <div className="absolute top-[10px] left-[40%] w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-glow-pulse shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
      <div className="absolute top-[15px] left-[60%] w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-glow-pulse shadow-[0_0_8px_rgba(124,58,237,0.8)]" style={{animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-[10px] left-[20%] w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-glow-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" style={{animationDelay: '1.2s'}}></div>
      <div className="absolute bottom-[12px] left-[80%] w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 animate-glow-pulse shadow-[0_0_10px_rgba(124,58,237,0.8)]" style={{animationDelay: '0.4s'}}></div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 z-[2] scanline opacity-10 pointer-events-none"></div>
      
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

// Futuristic Holographic NavLink for cyberpunk styling
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
      className={`relative px-5 py-2 mx-1 group perspective-800 ${
        active ? 'text-white' : 'text-cyan-300/80 hover:text-white'
      }`}
    >
      {/* Main container with 3D effects */}
      <div className={`relative transition-all duration-300 transform ${
        active ? 'scale-105' : 'group-hover:scale-105'
      }`}>
        {/* Text content with holographic glow */}
        <span 
          className="relative z-20 font-gaming tracking-wider text-sm inline-block" 
          style={{
            textShadow: active 
              ? "0 0 5px rgba(14, 165, 233, 0.9), 0 0 10px rgba(124, 58, 237, 0.5)"
              : "0 0 2px rgba(14, 165, 233, 0.3)",
            letterSpacing: "1px",
            transform: active ? "translateZ(5px)" : "",
            transition: "transform 0.3s ease, text-shadow 0.3s ease"
          }}
        >
          {children}
        </span>
        
        {/* Active state holographic container */}
        {active && (
          <>
            {/* Holographic background */}
            <div className="absolute inset-0 z-0 rounded-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-blue-950/40 to-black/50"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-purple-500/5"></div>
              
              {/* Glowing border */}
              <div className="absolute inset-0 border border-cyan-500/50 rounded-md"></div>
              <div className="absolute inset-[-1px] border border-purple-500/30 rounded-md animate-digital-pulse"></div>
              
              {/* Digital scan line */}
              <div className="absolute h-[1px] left-0 right-0 bg-gradient-to-r from-transparent via-cyan-400/90 to-transparent animate-pulse-width"></div>
              
              {/* Circuit pattern */}
              <div className="absolute inset-0 cyber-circuit-pattern opacity-10"></div>
            </div>
            
            {/* High-tech corner elements */}
            <div className="absolute left-0 top-0 w-2 h-2 border-l-2 border-t-2 border-cyan-500/70"></div>
            <div className="absolute right-0 top-0 w-2 h-2 border-r-2 border-t-2 border-purple-500/70"></div>
            <div className="absolute left-0 bottom-0 w-2 h-2 border-l-2 border-b-2 border-cyan-500/70"></div>
            <div className="absolute right-0 bottom-0 w-2 h-2 border-r-2 border-b-2 border-purple-500/70"></div>
            
            {/* Animated data points */}
            <span className="absolute w-1 h-1 rounded-full bg-cyan-400 top-0 right-[6px] animate-glow-pulse"></span>
            <span className="absolute w-1 h-1 rounded-full bg-purple-400 bottom-0 left-[6px] animate-glow-pulse" style={{animationDelay: '0.5s'}}></span>
          </>
        )}
        
        {/* Hover effects */}
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] transform transition-all duration-300 overflow-hidden ${
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 animate-pulse-width"></div>
        </div>
        
        {/* Hover glow effect */}
        <div className={`absolute -inset-[2px] z-[-1] rounded-md transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-cyan-500/30 to-blue-600/0 rounded-md blur-[4px]"></div>
        </div>
      </div>
    </Link>
  );
}
