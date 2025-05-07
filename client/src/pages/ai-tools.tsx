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
  
  const { data: aiTools, isLoading } = useQuery({
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
  
  // Filter tools by search query and category
  const filteredTools = (aiTools || []).filter((tool: any) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold font-gaming">AI Learning Tools</h1>
            <p className="text-gray-400 mt-1">Supercharge your learning with our AI-powered educational tools</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
            <div className="relative w-full md:w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                className="pl-9 bg-dark-card border-dark-border w-full"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-dark-card border-dark-border w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark-border">
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-dark-surface border-dark-border">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Skeleton className="h-10 w-10 rounded-lg mb-2" />
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool: any) => (
              <Card key={tool.id} className="bg-dark-surface border-dark-border overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`bg-${tool.color || 'blue'}-600/20 p-2 rounded-lg`}>
                        {getToolIcon(tool.name)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription>{tool.category || 'Study Tool'}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`bg-${tool.color || 'blue'}-600/20 text-${tool.color || 'blue'}-400 hover:bg-${tool.color || 'blue'}-600/30`}>
                      AI Powered
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <p className="text-gray-400 text-sm">{tool.description}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={getToolPath(tool.name)} className="w-full">
                    <Button 
                      className={`w-full bg-${tool.color || 'blue'}-600 hover:bg-${tool.color || 'blue'}-500 text-white`}
                    >
                      Open Tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-dark-card p-5 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tools found</h3>
            <p className="text-gray-400 max-w-md">
              We couldn't find any AI tools matching your search criteria. Try adjusting your filters or search term.
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
        
        {/* Coming Soon section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold font-gaming mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-dark-surface border-dark-border opacity-70">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600/20 p-2 rounded-lg">
                    <FlaskConical className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Flashcard Creator</CardTitle>
                    <CardDescription>Study Tool</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Generate personalized flashcards from your study materials for efficient memorization and recall.
                </p>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full bg-purple-800/30 text-white cursor-not-allowed">
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-dark-surface border-dark-border opacity-70">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-green-600/20 p-2 rounded-lg">
                    <BarChart className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Performance Analytics</CardTitle>
                    <CardDescription>Performance Tool</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Get detailed insights on your learning progress with AI-powered performance analytics and suggestions.
                </p>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full bg-green-800/30 text-white cursor-not-allowed">
                  Coming Soon
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}