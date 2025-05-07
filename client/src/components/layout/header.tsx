import { Link } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUser } from "@/contexts/user-context";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";

export function Header() {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const isMobile = useMobile();

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
    <header className="bg-dark-surface border-b border-dark-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="text-2xl font-bold font-gaming gaming-text">
                LearnityX
              </a>
            </Link>
            <span className="bg-primary-700 text-xs px-2 py-0.5 rounded-full font-medium">
              BETA
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            
            {!isMobile && (
              <div className="flex items-center space-x-4">
                <Link href="/courses">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    Courses
                  </a>
                </Link>
                <Link href="/battle-zone">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    Battle Zone
                  </a>
                </Link>
                <Link href="/ai-tools">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    AI Tools
                  </a>
                </Link>
                <Link href="/rewards">
                  <a className="text-gray-300 hover:text-white transition-colors">
                    Rewards
                  </a>
                </Link>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 group">
                <div className="rank-badge w-8 h-8">
                  <div className="bg-dark-surface w-7 h-7 rounded-full flex items-center justify-center z-10">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name || "Profile"} 
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                      </span>
                    )}
                  </div>
                </div>
                {!isMobile && (
                  <>
                    <span className="text-sm font-medium">{user?.name || "User"}</span>
                    <i className="ri-arrow-down-s-line text-gray-400 group-hover:text-white transition-colors"></i>
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile">
                    <a className="flex items-center w-full">
                      <i className="ri-user-line mr-2"></i>
                      Profile
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">
                    <a className="flex items-center w-full">
                      <i className="ri-settings-3-line mr-2"></i>
                      Settings
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <i className="ri-logout-box-line mr-2"></i>
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
