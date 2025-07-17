import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAdminSession = async () => {
      const adminSession = localStorage.getItem('adminSession');
      
      if (!adminSession) {
        setIsAdminAuthenticated(false);
        return;
      }

      try {
        // Validate session with backend
        const response = await fetch('/api/admin/validate', {
          method: 'GET',
          headers: {
            'admin-session': adminSession,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsAdminAuthenticated(true);
        } else {
          // Session expired or invalid
          localStorage.removeItem('adminSession');
          setIsAdminAuthenticated(false);
        }
      } catch (error) {
        // Network error or session invalid
        localStorage.removeItem('adminSession');
        setIsAdminAuthenticated(false);
      }
    };

    checkAdminSession();
  }, []);

  const handleAdminLogin = () => {
    setLocation('/admin-login');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setIsAdminAuthenticated(false);
  };

  // Loading state
  if (isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-lg">Verifying admin access...</div>
      </div>
    );
  }

  // Not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        
        <Card className="w-full max-w-md relative z-10 bg-black/40 border-red-500/30 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Access Restricted</CardTitle>
            <CardDescription className="text-gray-300">
              This area requires administrator authentication
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-orange-400 bg-orange-900/20 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Authorized personnel only</span>
            </div>

            <Button
              onClick={handleAdminLogin}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </Button>

            <p className="text-xs text-gray-400">
              All access attempts are logged and monitored
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - show the protected content with logout option
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-green-600 to-cyan-600 p-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Access Active</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-white border-white/30 hover:bg-white/10"
          >
            Logout
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}