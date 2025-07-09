import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, BarChart3, LineChart, PieChart, BookOpen, Brain, Clock, 
  TrendingUp, TrendingDown, Target, Award, AlertTriangle, Lightbulb,
  Calendar, Users, Activity, Zap, CheckCircle, XCircle, Eye, 
  RefreshCw, Download, Share2, Settings, Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart, LineChart as ReLineChart, PieChart as RePieChart, AreaChart, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  Bar, Line, Pie, Cell, Area, RadialBarChart, RadialBar
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { SubscriptionGuard } from "@/components/subscription/subscription-guard";

export default function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState("month");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  
  // Fetch comprehensive analytics data from new API
  const { data: analyticsData, isLoading: isLoadingAnalytics, refetch } = useQuery({
    queryKey: ['/api/analytics/comprehensive', user?.id, timeRange, subjectFilter, analysisType],
  });

  // Fetch student learning profile for AI tutor context
  const { data: learningProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/analytics/student-profile', user?.id],
  });

  // Fetch topic mastery data
  const { data: topicMastery, isLoading: isLoadingMastery } = useQuery({
    queryKey: ['/api/analytics/topic-mastery', user?.id, subjectFilter],
  });

  // Fetch learning patterns and insights
  const { data: learningInsights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['/api/analytics/learning-insights', user?.id, timeRange],
  });

  const isLoading = isLoadingAnalytics || isLoadingProfile || isLoadingMastery || isLoadingInsights;
  
  // Enhanced color scheme for different data types
  const COLORS = {
    primary: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'],
    performance: ['#22c55e', '#f59e0b', '#ef4444'],
    mastery: ['#06b6d4', '#8b5cf6', '#f97316', '#84cc16'],
    time: ['#3b82f6', '#6366f1', '#8b5cf6']
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6 pt-24">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/ai-tools">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-gaming">Performance Analytics</h1>
                <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30">
                  AI-Powered
                </Badge>
              </div>
              <p className="text-muted-foreground">Comprehensive insights from all your learning activities</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="border-cyan-500/30 hover:bg-cyan-500/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="border-cyan-500/30 hover:bg-cyan-500/10"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showDetails ? 'Simple' : 'Detailed'}
              </Button>
            </div>
          </div>
          
          {/* Enhanced Overview Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {learningProfile?.overallProgress || 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <Progress value={learningProfile?.overallProgress || 0} className="mt-3" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Strong Subjects</p>
                    <p className="text-2xl font-bold text-green-400">
                      {learningProfile?.strongSubjects?.length || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {learningProfile?.strongSubjects?.slice(0, 2).join(', ') || 'Building strengths...'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Improvement Areas</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {learningProfile?.weakSubjects?.length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-400" />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {learningProfile?.weakSubjects?.slice(0, 2).join(', ') || 'No weak areas found'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Learning Style</p>
                    <p className="text-2xl font-bold text-purple-400 capitalize">
                      {learningProfile?.learningStyle || 'Visual'}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-400" />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Personalized approach
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Filter Controls */}
          <Card className="mb-6 bg-background/60 border border-cyan-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Analysis Controls
                  </CardTitle>
                  <CardDescription>Customize your analytics view</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="quarter">Last 90 Days</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Focus</label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Type</label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="performance">Performance Only</SelectItem>
                      <SelectItem value="time_analysis">Time Analysis</SelectItem>
                      <SelectItem value="weakness_focus">Weakness Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-cyan-500/30 hover:bg-cyan-500/10"
                      disabled={true}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-cyan-500/30 hover:bg-cyan-500/10"
                      disabled={true}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Enhanced Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-background/40 border border-cyan-500/30 w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <BarChart3 className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="mastery" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Target className="h-4 w-4 mr-2" />
                Topic Mastery
              </TabsTrigger>
              <TabsTrigger value="patterns" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Calendar className="h-4 w-4 mr-2" />
                Learning Patterns
              </TabsTrigger>
              <TabsTrigger value="insights" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Lightbulb className="h-4 w-4 mr-2" />
                Recommendations
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="bg-dark-surface border-dark-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-cyan-400" />
                        Recent Learning Activity
                      </CardTitle>
                      <CardDescription>Your activity across all platform tools</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={learningInsights?.activityData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" stroke="#999" />
                            <YAxis stroke="#999" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="sessions" 
                              stackId="1"
                              stroke="#8884d8" 
                              fill="#8884d8"
                              fillOpacity={0.6}
                              name="Study Sessions"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="performance" 
                              stackId="2"
                              stroke="#82ca9d" 
                              fill="#82ca9d"
                              fillOpacity={0.6}
                              name="Performance %"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-surface border-dark-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        Tool Usage Distribution
                      </CardTitle>
                      <CardDescription>How you use different learning tools</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData?.toolUsage || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="sessions"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {(analyticsData?.toolUsage || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-400" />
                      Key Metrics
                    </CardTitle>
                    <CardDescription>Your learning statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Session Consistency</span>
                        <span className="font-medium">{learningInsights?.consistency || 0}%</span>
                      </div>
                      <Progress value={learningInsights?.consistency || 0} className="mt-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Knowledge Retention</span>
                        <span className="font-medium">{learningInsights?.retention || 0}%</span>
                      </div>
                      <Progress value={learningInsights?.retention || 0} className="mt-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Problem Solving</span>
                        <span className="font-medium">{learningInsights?.problemSolving || 0}%</span>
                      </div>
                      <Progress value={learningInsights?.problemSolving || 0} className="mt-2" />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Sessions</span>
                          <span className="font-medium">{learningInsights?.totalSessions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Study Hours</span>
                          <span className="font-medium">{learningInsights?.totalHours || 0}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Concepts Learned</span>
                          <span className="font-medium">{learningInsights?.conceptsLearned || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Streak</span>
                          <span className="font-medium">{user?.streakDays || 0} days</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-cyan-400" />
                      Subject Performance Trends
                    </CardTitle>
                    <CardDescription>Performance trends across subjects over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData?.subjectPerformance || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="subject" stroke="#999" />
                          <YAxis stroke="#999" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Legend />
                          <Bar dataKey="currentScore" name="Current Score" fill="#8884d8" />
                          <Bar dataKey="averageScore" name="Average Score" fill="#82ca9d" />
                          <Bar dataKey="improvement" name="Improvement" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      Performance Analysis
                    </CardTitle>
                    <CardDescription>Detailed breakdown of your academic performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                        <div className="text-2xl font-bold text-green-400">
                          {analyticsData?.strengths?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Strong Areas</div>
                      </div>
                      
                      <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-400" />
                        <div className="text-2xl font-bold text-red-400">
                          {analyticsData?.weaknesses?.length || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Improvement Areas</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Recent Performance</h4>
                      {(analyticsData?.recentPerformance || []).slice(0, 5).map((perf, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{perf.subject}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={perf.score} className="w-20" />
                            <span className="text-sm font-medium w-10">{perf.score}%</span>
                            {perf.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : perf.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            ) : (
                              <div className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Topic Mastery Tab */}
            <TabsContent value="mastery" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-cyan-400" />
                      Topic Mastery Levels
                    </CardTitle>
                    <CardDescription>Your mastery across different topics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))}
                      </div>
                    ) : (topicMastery?.topics || []).length > 0 ? (
                      (topicMastery.topics || []).map((topic, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{topic.name}</span>
                            <span className="text-muted-foreground">{topic.masteryLevel}%</span>
                          </div>
                          <Progress value={topic.masteryLevel} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{topic.conceptsLearned} concepts</span>
                            <span className={`font-medium ${
                              topic.masteryLevel >= 80 ? 'text-green-400' : 
                              topic.masteryLevel >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {topic.masteryLevel >= 80 ? 'Mastered' : 
                               topic.masteryLevel >= 60 ? 'Good' : 'Needs Work'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No topic mastery data yet</p>
                        <p className="text-sm text-muted-foreground">Complete lessons to track your progress</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-gold" />
                      Mastery Achievements
                    </CardTitle>
                    <CardDescription>Topics you've mastered completely</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                          ))}
                        </div>
                      ) : (topicMastery?.masteredTopics || []).length > 0 ? (
                        (topicMastery.masteredTopics || []).map((topic, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{topic.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Mastered on {new Date(topic.masteredDate).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                              {topic.score}%
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No mastered topics yet</p>
                          <p className="text-sm text-muted-foreground">Keep learning to achieve mastery!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Learning Patterns Tab */}
            <TabsContent value="patterns" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      Study Patterns
                    </CardTitle>
                    <CardDescription>When and how you learn best</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (learningInsights?.studyPatterns && learningInsights.studyPatterns.length > 0) ? (
                      <ResponsiveContainer width="100%" height={300} minHeight={300}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={learningInsights.studyPatterns}>
                          <RadialBar dataKey="value" cornerRadius={5} fill="#8884d8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                            labelStyle={{ color: '#fff' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                              <h4 className="font-medium text-sm">Consistent Learning (60%)</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Regular daily study sessions. Shows you maintain steady progress in NEET preparation. This pattern helps build strong foundation across Biology, Chemistry, and Physics.
                            </p>
                          </div>
                          
                          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                              <h4 className="font-medium text-sm">Intensive Sessions (25%)</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Deep focus study periods for complex topics like Organic Chemistry mechanisms and Human Physiology. Perfect for mastering difficult NEET concepts.
                            </p>
                          </div>
                          
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <h4 className="font-medium text-sm">Casual Learning (15%)</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Light review and quick practice sessions. Helps reinforce previously learned NEET topics and maintain knowledge retention between intensive study periods.
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-cyan-400" />
                            <span className="text-sm font-medium">How This Helps You</span>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• AI Tutor uses this data to suggest optimal study schedules for NEET</li>
                            <li>• Identifies when you learn Biology concepts most effectively</li>
                            <li>• Recommends mixing intensive and casual sessions for better retention</li>
                            <li>• Helps balance tough Physics topics with easier Biology revisions</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-400" />
                      Time Analysis
                    </CardTitle>
                    <CardDescription>Your learning time distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Morning Sessions</span>
                          <span className="font-medium">{learningInsights?.timeDistribution?.morning || 0}%</span>
                        </div>
                        <Progress value={learningInsights?.timeDistribution?.morning || 0} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Afternoon Sessions</span>
                          <span className="font-medium">{learningInsights?.timeDistribution?.afternoon || 0}%</span>
                        </div>
                        <Progress value={learningInsights?.timeDistribution?.afternoon || 0} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Evening Sessions</span>
                          <span className="font-medium">{learningInsights?.timeDistribution?.evening || 0}%</span>
                        </div>
                        <Progress value={learningInsights?.timeDistribution?.evening || 0} className="h-2" />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Optimal Study Time</h4>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span className="text-sm">
                            Best performance: {learningInsights?.optimalTime || 'Morning'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      AI Learning Analysis
                    </CardTitle>
                    <CardDescription>AI-powered insights from your learning data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (analyticsData?.insights || []).length > 0 ? (
                      (analyticsData.insights || []).map((insight, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          insight.type === 'strength' ? 'bg-green-500/10 border-green-500/20' :
                          insight.type === 'weakness' ? 'bg-red-500/10 border-red-500/20' :
                          'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <div className="flex items-start gap-3">
                            {insight.type === 'strength' ? (
                              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                            ) : insight.type === 'weakness' ? (
                              <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                            ) : (
                              <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5" />
                            )}
                            <div>
                              <h4 className="text-sm font-medium">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">AI insights will appear here</p>
                        <p className="text-sm text-muted-foreground">Complete more activities for analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-dark-surface border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-cyan-400" />
                      Learning Behavior
                    </CardTitle>
                    <CardDescription>Patterns in your learning behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Focus Duration</span>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {learningInsights?.focusDuration || 25} min avg
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Preferred Difficulty</span>
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {learningInsights?.preferredDifficulty || 'Medium'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Learning Speed</span>
                        <Badge className="bg-green-500/20 text-green-400">
                          {learningInsights?.learningSpeed || 'Normal'}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Behavioral Insights</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• Most active during {learningInsights?.mostActiveTime || 'evening'} hours</p>
                        <p>• Prefers {learningInsights?.preferredContentType || 'visual'} learning content</p>
                        <p>• Best performance in {learningInsights?.bestSubject || 'mathematics'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>AI-generated suggestions to improve your learning</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : (analyticsData?.recommendations || []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(analyticsData.recommendations || []).map((rec, index) => (
                        <Card key={index} className={`${
                          rec.priority === 'high' ? 'bg-red-500/10 border-red-500/20' :
                          rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                          'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-md">{rec.title}</CardTitle>
                              <Badge className={`${
                                rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {rec.priority}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Impact: {rec.expectedImprovement}%
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs"
                                disabled={true}
                              >
                                Apply
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No recommendations available yet</p>
                      <p className="text-sm text-muted-foreground">Complete more learning activities to get personalized suggestions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  );
}