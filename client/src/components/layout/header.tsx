import { Link } from "wouter";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { Brain, MenuIcon, ChevronDown, User, LogOut, Zap } from "lucide-react";

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

  const handleLogout = useCallback(async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  }, [setUser, toast]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glassmorphism backdrop-blur-md border-b border-primary/20' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with cyberpunk styling */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center">
              <div className="relative w-10 h-10 mr-2">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-xl animate-pulse opacity-70 blur-sm"></div>
                <div className="absolute inset-0.5 bg-gradient-to-br from-primary to-purple-800 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white futuristic-glow" />
                </div>
              </div>
              <div className="relative">
                <span className="text-2xl font-gaming tracking-wide text-white">LearnityX</span>
                <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </div>
            </Link>
            <div className="flex items-center h-5 px-2 bg-primary/20 border border-primary/40 rounded-sm">
              <span className="text-xs font-mono text-primary animate-pulse">BETA</span>
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
            
            {/* User avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 group">
                <div className="rank-badge w-9 h-9 animated-gradient-border p-[1px] rounded-full">
                  <div className="bg-background w-full h-full rounded-full flex items-center justify-center relative z-10 overflow-hidden">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name || "Profile"} 
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {!isMobile && (
                  <>
                    <span className="text-sm font-medium text-gray-200">{user?.name || "User"}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glassmorphism border border-primary/20">
                <DropdownMenuLabel className="text-gray-300">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    My Account
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem asChild className="hover:bg-primary/10">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-primary/10">
                  <LogOut className="h-4 w-4 mr-2 text-gray-400" />
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

// Custom navigation link with futuristic styling
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
      className={`relative px-4 py-2 mx-1 group ${active ? 'text-white' : 'text-gray-400 hover:text-gray-200'} transition-colors`}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <div className="absolute inset-0 bg-primary/10 rounded-md backdrop-blur-sm"></div>
      )}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{
        transform: active ? 'scaleX(1)' : ''  
      }}></div>
    </Link>
  );
}
