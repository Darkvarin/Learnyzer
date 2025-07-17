import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, AlertTriangle, Eye, Lock, Users, Activity, 
  Download, RefreshCw, Search, Filter, Clock, MapPin 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SecurityEvent {
  id: string;
  event: string;
  severity: "low" | "medium" | "high" | "critical";
  ip?: string;
  userId?: number;
  timestamp: Date;
  metadata?: any;
}

interface SecurityAnalysis {
  failedLogins: number;
  rateLimitViolations: number;
  suspiciousIPs: string[];
  recentThreats: SecurityEvent[];
  totalEvents: number;
  riskScore: number;
}

export default function SecurityDashboard() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");

  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/security/events", timeRange],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: securityAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/security/analysis"],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: activeThreats } = useQuery({
    queryKey: ["/api/security/threats/active"],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const exportSecurityLogs = async () => {
    try {
      const response = await apiRequest("GET", "/api/security/export");
      const blob = new Blob([response], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Security log export failed
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm border-b border-red-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent,transparent)]"></div>
        <div className="container mx-auto px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-red-400" />
                Security Command Center
              </h1>
              <p className="text-red-100 text-lg">
                Real-time security monitoring and threat detection for Learnyzer
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={exportSecurityLogs}
                variant="outline" 
                className="border-red-500/50 text-red-100 hover:bg-red-500/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500/50 text-red-100 hover:bg-red-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Failed Logins</p>
                  <p className="text-2xl font-bold text-white">
                    {securityAnalysis?.failedLogins || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Lock className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="destructive" className="text-xs">
                  Last 24h
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Rate Limit Violations</p>
                  <p className="text-2xl font-bold text-white">
                    {securityAnalysis?.rateLimitViolations || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Last Hour
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Suspicious IPs</p>
                  <p className="text-2xl font-bold text-white">
                    {securityAnalysis?.suspiciousIPs?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Monitored
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Risk Score</p>
                  <p className="text-2xl font-bold text-white">
                    {securityAnalysis?.riskScore || 0}/100
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-2">
                <Progress 
                  value={securityAnalysis?.riskScore || 0} 
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Threats Alert */}
        {activeThreats && activeThreats.length > 0 && (
          <Card className="bg-red-900/20 border-red-500/50 mb-8">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Security Threats Detected
              </CardTitle>
              <CardDescription className="text-red-200">
                Immediate attention required for {activeThreats.length} active threat(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeThreats.map((threat: SecurityEvent, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-800/20 rounded-lg border border-red-500/30">
                    <div>
                      <p className="text-white font-medium">{threat.event}</p>
                      <p className="text-red-200 text-sm">
                        IP: {threat.ip} • {new Date(threat.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {threat.severity.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Events */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-cyan-400" />
                  Security Events
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Real-time monitoring of security events and incidents
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <select 
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-8 text-slate-400">
                <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
                Loading security events...
              </div>
            ) : securityEvents && securityEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {securityEvents
                  .filter((event: SecurityEvent) => 
                    selectedSeverity === "all" || event.severity === selectedSeverity
                  )
                  .map((event: SecurityEvent, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`}></div>
                      <div>
                        <p className="text-white font-medium">{event.event}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          {event.ip && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.ip}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                          {event.userId && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              User {event.userId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(event.severity)}>
                      {event.severity.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No security events in the selected time range</p>
                <p className="text-sm">This is good news - your platform is secure!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}