import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, BookOpen, Sword, Brain, Cpu, BarChart3 } from "lucide-react";

export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="md:hidden glassmorphism border-t border-primary/20 fixed bottom-0 left-0 right-0 z-50">
      {/* Cyber scan line at top of mobile nav */}
      <div className="absolute top-0 left-0 right-0 h-px cyber-scan-line"></div>
      
      {/* Mobile navigation content */}
      <div className="grid grid-cols-6 items-center justify-between px-2 py-3">
        <MobileNavLink 
          href="/" 
          isActive={location === '/'} 
          icon={<Home className="h-5 w-5" />}
          label="Home"
        />
        <MobileNavLink 
          href="/dashboard" 
          isActive={location === '/dashboard'} 
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
        />
        <MobileNavLink 
          href="/battle-zone-enhanced" 
          isActive={location === '/battle-zone-enhanced'}
          icon={<Sword className="h-5 w-5" />} 
          label="Battle"
        />
        <MobileNavLink 
          href="/ai-tutor" 
          isActive={location === '/ai-tutor'} 
          icon={<Brain className="h-5 w-5" />}
          label="AI Tutor"
        />
        <MobileNavLink 
          href="/ai-tools" 
          isActive={location === '/ai-tools'} 
          icon={<Cpu className="h-5 w-5" />}
          label="AI Tools"
        />
        <MobileNavLink 
          href="/leaderboard" 
          isActive={location === '/leaderboard'} 
          icon={<BarChart3 className="h-5 w-5" />}
          label="Ranks"
        />
      </div>
    </div>
  );
}

// Futuristic nav link for mobile
function MobileNavLink({ 
  href, 
  isActive, 
  icon, 
  label 
}: { 
  href: string; 
  isActive: boolean; 
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-center flex-col py-3 px-2 relative group min-h-[44px] ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-200'} transition-colors`}
    >
      {/* Active glow effect */}
      {isActive && (
        <div className="absolute inset-0 bg-primary/10 rounded-md"></div>
      )}
      
      {/* Icon with glow effect when active */}
      <div className="relative">
        {isActive && (
          <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full"></div>
        )}
        <div className={`relative z-10 ${isActive ? 'text-primary futuristic-glow' : ''}`}>
          {icon}
        </div>
      </div>
      
      {/* Label with active indicator */}
      <div className="flex flex-col items-center mt-1">
        <span className="text-xs font-medium">{label}</span>
        {isActive && (
          <span className="w-1 h-1 rounded-full bg-primary mt-1"></span>
        )}
      </div>
    </Link>
  );
}
