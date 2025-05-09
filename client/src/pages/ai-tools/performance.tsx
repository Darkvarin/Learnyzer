import { useState } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, BarChart3, LineChart, PieChart, BookOpen, Brain, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart as ReLineChart, PieChart as RePieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, Pie, Cell } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

export default function PerformanceAnalytics() {
  const [timeRange, setTimeRange] = useState("month");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const { user } = useAuth();
  
  // Fetch user performance data
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['/api/ai/tools/analytics/' + (user?.id || ''), timeRange, subjectFilter],
  });
  
  // Use real API data if available, otherwise use empty data structures
  const analyticsData = performanceData || {
    subjectPerformance: [],
    timeSpent: [],
    skillDistribution: [],
    weaknesses: [],
    strengths: [],
    recommendations: []
  };
  
  // Dynamic colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
  
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
          <div>
            <h1 className="text-2xl font-bold font-gaming">Performance Analytics</h1>
            <p className="text-muted-foreground">AI-powered insights to improve your learning</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Card className="bg-background/60 border border-cyan-500/30 h-full relative overflow-hidden backdrop-blur-sm">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance Overview</CardTitle>
                <CardDescription>
                  Analysis of your learning progress and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 text-center">
                  <div className="flex-1 p-4 bg-dark-card rounded-lg">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold">{user?.level || 0}</div>
                    <div className="text-sm text-muted-foreground">Current Level</div>
                  </div>
                  
                  <div className="flex-1 p-4 bg-dark-card rounded-lg">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-2xl font-bold">{performanceData?.accuracyRate || '0%'}</div>
                    <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                  </div>
                  
                  <div className="flex-1 p-4 bg-dark-card rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold">{performanceData?.totalStudyTime || '0h'}</div>
                    <div className="text-sm text-muted-foreground">Study Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-1/3">
            <Card className="bg-background/60 border border-cyan-500/30 h-full relative overflow-hidden backdrop-blur-sm">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>
                  Customize the data view
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 border-cyan-500/30">
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="bg-background/40 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 border-cyan-500/30">
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="bg-background/40 border border-cyan-500/30 w-full justify-start overflow-x-auto">
            <TabsTrigger value="performance" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <LineChart className="h-4 w-4 mr-2" />
              Time Analysis
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <PieChart className="h-4 w-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="text-lg">Subject Performance</CardTitle>
                  <CardDescription>
                    Your performance across different subjects
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoadingPerformance ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading performance data...</p>
                      </div>
                    </div>
                  ) : analyticsData.subjectPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.subjectPerformance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="subject" stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                          labelStyle={{ color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="score" name="Your Score" fill="#8884d8" />
                        <Bar dataKey="average" name="Class Average" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-4">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No subject performance data available yet.</p>
                        <p className="text-sm text-muted-foreground">Complete more activities to generate insights.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="text-lg">Strengths & Weaknesses</CardTitle>
                  <CardDescription>
                    Areas where you excel and need improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPerformance ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Analyzing your learning patterns...</p>
                      </div>
                    </div>
                  ) : analyticsData.weaknesses.length > 0 || analyticsData.strengths.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Badge className="mr-2 bg-red-500/20 text-red-400 hover:bg-red-500/30">Needs Improvement</Badge>
                        </h4>
                        <div className="space-y-2">
                          {analyticsData.weaknesses.length > 0 ? analyticsData.weaknesses.map((area, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-full bg-dark-card rounded-full h-4 mr-2">
                                <div
                                  className="bg-gradient-to-r from-red-500/50 to-red-400 h-4 rounded-full"
                                  style={{ width: `${area.score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm whitespace-nowrap w-12">{area.score}%</span>
                              <span className="text-sm ml-2 text-muted-foreground">{area.topic}</span>
                            </div>
                          )) : (
                            <p className="text-sm text-muted-foreground">No improvement areas identified yet</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <Badge className="mr-2 bg-green-500/20 text-green-400 hover:bg-green-500/30">Strong Areas</Badge>
                        </h4>
                        <div className="space-y-2">
                          {analyticsData.strengths.length > 0 ? analyticsData.strengths.map((area, index) => (
                            <div key={index} className="flex items-center">
                              <div className="w-full bg-dark-card rounded-full h-4 mr-2">
                                <div
                                  className="bg-gradient-to-r from-green-500/50 to-green-400 h-4 rounded-full"
                                  style={{ width: `${area.score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm whitespace-nowrap w-12">{area.score}%</span>
                              <span className="text-sm ml-2 text-muted-foreground">{area.topic}</span>
                            </div>
                          )) : (
                            <p className="text-sm text-muted-foreground">No strengths identified yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="text-center p-4">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No strength/weakness data available yet.</p>
                        <p className="text-sm text-muted-foreground">Complete more quizzes and assessments to generate insights.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="time" className="space-y-4">
            <Card className="bg-dark-surface border-dark-border">
              <CardHeader>
                <CardTitle className="text-lg">Study Time Distribution</CardTitle>
                <CardDescription>
                  Hours spent studying over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingPerformance ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading time data...</p>
                    </div>
                  </div>
                ) : analyticsData.timeSpent.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart
                      data={analyticsData.timeSpent}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="date" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        name="Study Hours" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No study time data available yet.</p>
                      <p className="text-sm text-muted-foreground">Complete more courses to track your study hours.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4">
            <Card className="bg-dark-surface border-dark-border">
              <CardHeader>
                <CardTitle className="text-lg">Skill Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your skills across different learning domains
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingPerformance ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Analyzing your skills...</p>
                    </div>
                  </div>
                ) : analyticsData.skillDistribution && analyticsData.skillDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={analyticsData.skillDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.skillDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No skill distribution data available yet.</p>
                      <p className="text-sm text-muted-foreground">Complete more activities to generate a skill breakdown.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <Card className="bg-dark-surface border-dark-border">
              <CardHeader>
                <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
                <CardDescription>
                  Personalized recommendations based on your learning patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPerformance ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Generating personalized insights...</p>
                    </div>
                  </div>
                ) : analyticsData.recommendations && analyticsData.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.recommendations.map((rec) => (
                      <Card key={rec.id} className={`bg-${rec.category === 'weakness' ? 'red' : rec.category === 'strength' ? 'green' : 'blue'}-500/10 border-${rec.category === 'weakness' ? 'red' : rec.category === 'strength' ? 'green' : 'blue'}-500/20`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md">{rec.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{rec.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No AI insights available yet.</p>
                      <p className="text-sm text-muted-foreground">Complete more activities to receive personalized recommendations.</p>
                    </div>
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