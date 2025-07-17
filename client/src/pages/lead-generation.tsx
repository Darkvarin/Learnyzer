import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/ui/back-button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, Search, Filter, Users, Mail, Phone, 
  Calendar, TrendingUp, Copy, FileSpreadsheet, Database
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

interface LeadData {
  id: number;
  username: string;
  name: string;
  email: string | null;
  mobile: string | null;
  grade: string | null;
  track: string | null;
  createdAt: string;
  totalXp: number;
  level: number;
  referralCode: string;
}

interface LeadStats {
  total: number;
  withEmail: number;
  withMobile: number;
  withBothContacts: number;
  recentLeads: number;
  leadsByGrade: Array<{ grade: string; count: number }>;
}

export default function LeadGeneration() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    hasEmail: "any_email",
    hasMobile: "any_mobile",
    grade: "any_grade",
    track: ""
  });
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const { data: leadStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["admin-leads-stats"],
    queryFn: () => adminApi.getLeadStats(),
    refetchInterval: 300000, // Refresh every 5 minutes
    retry: false
  });

  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads, error: leadsError } = useQuery({
    queryKey: ["admin-leads", filters],
    queryFn: () => adminApi.getLeads(filters),
    refetchInterval: 60000, // Refresh every minute
    retry: false
  });

  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ["admin-leads-search", searchQuery],
    queryFn: () => adminApi.searchLeads(searchQuery),
    enabled: searchQuery.length > 0,
    refetchInterval: false,
    retry: false
  });

  const { data: emailList, error: emailError } = useQuery({
    queryKey: ["admin-email-list", filters],
    queryFn: () => adminApi.getEmailList(filters),
    refetchInterval: false,
    retry: false
  });

  const { data: mobileList, error: mobileError } = useQuery({
    queryKey: ["admin-mobile-list", filters],
    queryFn: () => adminApi.getMobileList(filters),
    refetchInterval: false,
    retry: false
  });

  const exportToExcel = async () => {
    try {
      const blob = await adminApi.exportLeads(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Excel file has been downloaded with all lead data",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export lead data to Excel",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: `${type} list copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyEmailList = () => {
    if (emailList?.emails) {
      copyToClipboard(emailList.emails.join(', '), 'Email');
    }
  };

  const copyMobileList = () => {
    if (mobileList?.mobiles) {
      copyToClipboard(mobileList.mobiles.join(', '), 'Mobile');
    }
  };

  const displayLeads = searchQuery ? searchResults : leads;

    // Check for admin access errors
  const isAdminError = (error: any) => {
    return error?.message?.includes('403') || error?.message?.includes('Admin access required');
  };

  const hasAdminError = isAdminError(statsError) || isAdminError(leadsError) || isAdminError(searchError) || isAdminError(emailError) || isAdminError(mobileError);

  // If user doesn't have admin access, show access denied message
  if (hasAdminError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8">
            <div className="flex justify-center mb-4">
              <Database className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">
              Admin Access Required
            </h1>
            <p className="text-red-600 dark:text-red-400 mb-6">
              This lead generation dashboard is only accessible to administrators. 
              Contact your system administrator if you need access to this feature.
            </p>
            <div className="space-y-3">
              <BackButton fallbackPath="/dashboard" className="w-full">
                Return to Dashboard
              </BackButton>
              <div className="text-sm text-red-500">
                Error Code: 403 - Forbidden Access
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/20 to-green-900/20 backdrop-blur-sm border-b border-blue-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent,transparent)]"></div>
        <div className="container mx-auto px-6 py-8 relative">
          {/* Back button */}
          <div className="mb-4">
            <BackButton fallbackPath="/dashboard" className="text-white hover:text-blue-400" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-400" />
                Lead Generation Dashboard
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-normal">Admin Only</span>
              </h1>
              <p className="text-blue-100 text-lg">
                Comprehensive lead management and email/mobile collection system
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
              <Button 
                onClick={() => refetchLeads()}
                variant="outline" 
                className="border-blue-500/50 text-blue-100 hover:bg-blue-500/10"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Leads</p>
                  <p className="text-2xl font-bold text-white">
                    {leadStats?.total || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">With Email</p>
                  <p className="text-2xl font-bold text-white">
                    {leadStats?.withEmail || 0}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">With Mobile</p>
                  <p className="text-2xl font-bold text-white">
                    {leadStats?.withMobile || 0}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Complete Contact</p>
                  <p className="text-2xl font-bold text-white">
                    {leadStats?.withBothContacts || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Recent (30d)</p>
                  <p className="text-2xl font-bold text-white">
                    {leadStats?.recentLeads || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="emails">Email List</TabsTrigger>
            <TabsTrigger value="mobiles">Mobile List</TabsTrigger>
            <TabsTrigger value="leads">All Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Filters */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-slate-300">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-slate-300">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Has Email</Label>
                  <Select value={filters.hasEmail} onValueChange={(value) => setFilters({...filters, hasEmail: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any_email">Any</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Has Mobile</Label>
                  <Select value={filters.hasMobile} onValueChange={(value) => setFilters({...filters, hasMobile: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any_mobile">Any</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Grade</Label>
                  <Select value={filters.grade} onValueChange={(value) => setFilters({...filters, grade: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Any Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any_grade">Any Grade</SelectItem>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 3} value={`${i + 3}`}>Grade {i + 3}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="search" className="text-slate-300">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Name, email, mobile..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads by Grade Chart */}
            {leadStats?.leadsByGrade && leadStats.leadsByGrade.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Leads by Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leadStats.leadsByGrade.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-white font-medium">Grade {item.grade}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(item.count / leadStats.total) * 100}%` }}
                            ></div>
                          </div>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emails">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="h-5 w-5 text-green-400" />
                      Email Addresses ({emailList?.count || 0})
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      All email addresses from registered users
                    </CardDescription>
                  </div>
                  <Button onClick={copyEmailList} variant="outline" className="border-green-500/50">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Emails
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emailList?.emails && emailList.emails.length > 0 ? (
                  <div className="bg-slate-700/30 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {emailList.emails.map((email, index) => (
                        <div key={index} className="text-sm text-slate-300 p-2 bg-slate-600/30 rounded">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No email addresses found with current filters</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobiles">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Phone className="h-5 w-5 text-purple-400" />
                      Mobile Numbers ({mobileList?.count || 0})
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      All mobile numbers from registered users
                    </CardDescription>
                  </div>
                  <Button onClick={copyMobileList} variant="outline" className="border-purple-500/50">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Mobiles
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mobileList?.mobiles && mobileList.mobiles.length > 0 ? (
                  <div className="bg-slate-700/30 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {mobileList.mobiles.map((mobile, index) => (
                        <div key={index} className="text-sm text-slate-300 p-2 bg-slate-600/30 rounded">
                          {mobile}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No mobile numbers found with current filters</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Leads Data</CardTitle>
                <CardDescription className="text-slate-300">
                  Complete lead information with contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {displayLeads && displayLeads.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-slate-300">Name</TableHead>
                          <TableHead className="text-slate-300">Username</TableHead>
                          <TableHead className="text-slate-300">Email</TableHead>
                          <TableHead className="text-slate-300">Mobile</TableHead>
                          <TableHead className="text-slate-300">Grade</TableHead>
                          <TableHead className="text-slate-300">Track</TableHead>
                          <TableHead className="text-slate-300">Level</TableHead>
                          <TableHead className="text-slate-300">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayLeads.map((lead: LeadData) => (
                          <TableRow key={lead.id}>
                            <TableCell className="text-white font-medium">{lead.name}</TableCell>
                            <TableCell className="text-slate-300">{lead.username}</TableCell>
                            <TableCell className="text-green-400">
                              {lead.email || <span className="text-slate-500">No email</span>}
                            </TableCell>
                            <TableCell className="text-purple-400">
                              {lead.mobile || <span className="text-slate-500">No mobile</span>}
                            </TableCell>
                            <TableCell className="text-slate-300">{lead.grade || 'N/A'}</TableCell>
                            <TableCell className="text-slate-300">{lead.track || 'N/A'}</TableCell>
                            <TableCell className="text-cyan-400">{lead.level}</TableCell>
                            <TableCell className="text-slate-300">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    {leadsLoading || searchLoading ? "Loading leads..." : "No leads found"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}