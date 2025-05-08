import { useState } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  BookText, 
  FileCheck, 
  Brain, 
  BarChart, 
  FlaskConical, 
  Flashlight, 
  Search,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AITool } from "@shared/schema";

export default function AITools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const { data: aiTools = [], isLoading } = useQuery<AITool[]>({
    queryKey: ['/api/ai/tools'],
  });
  
  // Tool categories
  const categories = [
    { id: "all", name: "All Tools" },
    { id: "study", name: "Study" },
    { id: "assessment", name: "Assessment" },
    { id: "performance", name: "Performance" },
    { id: "preparation", name: "Exam Prep" }
  ];
  
  // Tool icon mapping
  const getToolIcon = (toolName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Study Notes Generator": <BookText className="h-6 w-6" />,
      "Answer Checker": <FileCheck className="h-6 w-6" />,
      "Flashcard Creator": <FlaskConical className="h-6 w-6" />,
      "Performance Analytics": <BarChart className="h-6 w-6" />,
      "AI Tutor": <Brain className="h-6 w-6" />
    };
    
    return iconMap[toolName] || <Flashlight className="h-6 w-6" />;
  };
  
  // Tool routing path mapping
  const getToolPath = (toolName: string) => {
    const pathMap: Record<string, string> = {
      "Study Notes Generator": "/ai-tools/study-notes",
      "Answer Checker": "/ai-tools/answer-checker",
      "Flashcard Creator": "/ai-tools/flashcards",
      "Performance Analytics": "/ai-tools/performance",
      "AI Tutor": "/ai-tutor"
    };
    
    return pathMap[toolName] || "/";
  };
  
  // Color mapping for tools
  type ToolColorType = 'primary' | 'success' | 'warning' | 'purple' | 'danger' | 'blue' | string;
  const colorMap: Record<string, string> = {
    primary: 'primary',
    success: 'emerald',
    warning: 'amber',
    purple: 'fuchsia',
    danger: 'rose',
    blue: 'cyan'
  };
  
  // Filter tools by search query and category
  const filteredTools = aiTools.filter((tool) => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen flex flex-col solo-bg relative overflow-hidden solo-page">
      {/* Solo Leveling background elements */}
      <div className="absolute inset-0 solo-grid z-0 opacity-30"></div>
      
      {/* Solo Leveling corner decorations */}
      <div className="absolute top-24 right-4 w-32 h-32 solo-corner-tr z-0"></div>
      <div className="absolute bottom-4 left-4 w-32 h-32 solo-corner-bl z-0"></div>
      
      {/* Fixed scan line effect */}
      <div className="fixed inset-0 h-screen pointer-events-none z-[1]">
        <div className="absolute top-0 left-0 right-0 h-[2px] solo-scan-line"></div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6 relative z-10">
        <div className="relative monarch-card-glow p-6 rounded-xl mb-8">
          {/* Solo Leveling accent elements */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 z-10"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary/40 z-10"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-gaming gaming-text mb-2 text-glow">
                <span className="gradient-text" style={{
                  background: "linear-gradient(90deg, #06b6d4, #7d27ff, #06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% auto",
                  animation: "gradient-animation 3s linear infinite"
                }}>AI Learning Tools</span>
              </h1>
              <p className="text-cyan-100/80 mt-1 border-l-2 border-cyan-500/50 pl-4">
                Summon the power of AI to enhance your learning journey
              </p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
              <div className="relative w-full md:w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 h-4 w-4" />
                <Input
                  className="pl-9 bg-background/60 border-cyan-500/30 w-full focus:border-cyan-400 focus:ring-cyan-400/20"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-background/60 border-primary/30 w-full md:w-[180px] focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 border-primary/30">
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-background/40 border-cyan-500/20 relative">
                {/* Solo Leveling skeleton corner decorations */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-500/60"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-500/60"></div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Skeleton className="h-10 w-10 rounded-lg mb-2 bg-cyan-500/10" />
                      <Skeleton className="h-5 w-32 mb-1 bg-primary/10" />
                      <Skeleton className="h-4 w-48 bg-cyan-500/10" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full bg-primary/10" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <Skeleton className="h-4 w-full mb-1 bg-cyan-500/10" />
                  <Skeleton className="h-4 w-3/4 bg-primary/10" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full rounded-md bg-cyan-500/10" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool: any) => {
              const toolColor = tool.color || 'cyan';
              const colorMap = {
                primary: 'primary',
                success: 'emerald',
                warning: 'amber',
                purple: 'fuchsia',
                danger: 'rose',
                blue: 'cyan'
              };
              const mappedColor = colorMap[toolColor] || 'cyan';
              
              // Safety check for tool properties with additional type safety
              const toolId = tool.id ?? 0;
              const toolName = tool.name ?? "AI Tool";
              const toolDescription = tool.description ?? "Powerful AI-powered educational tool";
              const toolCategory = tool.category ?? "Study Tool";
              
              return (
                <Card key={toolId} className={`bg-background/50 border-${mappedColor}-500/30 overflow-hidden flex flex-col relative monarch-card-glow-${mappedColor === 'primary' ? 'purple' : mappedColor} group hover:bg-background/60 transition-all duration-300`}>
                  {/* Solo Leveling corner decorations */}
                  <div className={`absolute -top-1 -left-1 w-3 h-3 border-t border-l border-${mappedColor}-500/60`}></div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-${mappedColor}-500/60`}></div>
                  
                  {/* Power aura on hover */}
                  <div className={`absolute inset-0 ${mappedColor}-aura opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  
                  <CardHeader className="pb-2 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`bg-${mappedColor}-500/10 p-3 rounded-lg relative overflow-hidden`}>
                          {/* Animated glow effect */}
                          <div className={`absolute inset-0 bg-${mappedColor}-500/5 animate-pulse`}></div>
                          
                          {/* Icon with Solo Leveling glow */}
                          <div className={`text-${mappedColor}-400 solo-icon`}>
                            {getToolIcon(toolName)}
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{toolName}</CardTitle>
                          <CardDescription className={`text-${mappedColor}-200/70`}>{toolCategory}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`bg-${mappedColor}-500/10 text-${mappedColor}-300 hover:bg-${mappedColor}-500/20 border border-${mappedColor}-500/30`}>
                        AI Powered
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 flex-grow">
                    <p className={`text-${mappedColor}-100/80 text-sm`}>{toolDescription}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={getToolPath(toolName)} className="w-full group">
                      <Button 
                        className={`w-full bg-${mappedColor}-500/80 hover:bg-${mappedColor}-500 text-white transform transition-all duration-300 
                          hover:translate-y-[-2px] relative overflow-hidden border border-${mappedColor}-400/20`}
                      >
                        {/* Solo Leveling button effect */}
                        <div className={`absolute inset-0 ${mappedColor}-aura opacity-0 group-hover:opacity-30 transition-opacity duration-200`}></div>
                        
                        <span className="relative z-10 font-medium">Open Tool</span>
                        <ArrowRight className={`ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-${mappedColor}-100`} />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center monarch-card-glow p-8 rounded-xl">
            {/* Solo Leveling accent elements */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 z-10"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-primary/40 z-10"></div>
            
            <div className="bg-background/60 p-5 rounded-full mb-4 border border-cyan-500/20">
              <Search className="h-8 w-8 text-cyan-400 solo-icon" />
            </div>
            <h3 className="text-xl font-gaming mb-2 text-glow">No Tools Found</h3>
            <p className="text-cyan-100/70 max-w-md border-l-2 border-cyan-500/30 pl-4 text-left mx-auto">
              We couldn't find any AI tools matching your criteria. Try adjusting your filters or search term.
            </p>
            <Button 
              className="mt-6 bg-cyan-500/80 hover:bg-cyan-500 text-white hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden border border-cyan-400/20"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
            >
              <div className="absolute inset-0 cyan-aura opacity-0 hover:opacity-30 transition-opacity duration-200"></div>
              <span className="relative z-10">Clear Filters</span>
            </Button>
          </div>
        )}
        
        {/* Coming Soon section */}
        <div className="mt-12 relative">
          {/* Solo Leveling accent bar and title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-fuchsia-500/70 via-primary/50 to-fuchsia-500/20"></div>
            <h2 className="text-2xl font-gaming text-glow">
              <span className="gradient-text" style={{
                background: "linear-gradient(90deg, #d946ef, #7d27ff, #d946ef)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
                animation: "gradient-animation 3s linear infinite"
              }}>Coming Soon</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-background/30 border-fuchsia-500/30 relative monarch-card-glow-fuchsia group">
              {/* Solo Leveling corner decorations */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-fuchsia-500/60"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-fuchsia-500/60"></div>
              
              {/* Locked state overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="text-fuchsia-300/90 font-gaming text-2xl text-glow">Coming Soon</div>
              </div>
              
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-fuchsia-500/10 p-3 rounded-lg relative overflow-hidden">
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 bg-fuchsia-500/5 animate-pulse"></div>
                    <FlaskConical className="h-6 w-6 text-fuchsia-400 solo-icon" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">Flashcard Creator</CardTitle>
                    <CardDescription className="text-fuchsia-200/70">Study Tool</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-fuchsia-100/80 text-sm">
                  Generate personalized flashcards from your study materials for efficient memorization and recall.
                </p>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full bg-fuchsia-900/50 text-fuchsia-300/90 border border-fuchsia-500/20 cursor-not-allowed">
                  <div className="animate-pulse">Coming Soon</div>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}