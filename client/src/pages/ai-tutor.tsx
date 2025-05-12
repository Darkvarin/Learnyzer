import { useState, useRef, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { 
  Send, 
  Mic, 
  Paperclip, 
  Settings2, 
  MessageSquare,
  Bot as Robot,
  HelpCircle,
  Book,
  GraduationCap,
  FileCheck,
  UserCircle,
  
  PenTool,
  Eraser,
  ArrowLeftCircle,
  BarChart4,
  AlertTriangle,
  Check,
  ImageIcon,
  PieChart,
  Search as ScanSearch
} from "lucide-react";

export default function AiTutor() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Parse URL parameters if coming from course page
  const searchParams = new URLSearchParams(window.location.search);
  const subjectParam = searchParams.get('subject');
  const chapterParam = searchParams.get('chapter');
  const courseParam = searchParams.get('course');
  
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [activeTool, setActiveTool] = useState("pen");
  const [currentSubject, setCurrentSubject] = useState(subjectParam?.toLowerCase() || "mathematics");
  const [currentTopic, setCurrentTopic] = useState(chapterParam || "");
  const [isGeneratingWhiteboard, setIsGeneratingWhiteboard] = useState(false);
  const [weakPoints, setWeakPoints] = useState<string[]>([]); 
  const whiteboardRef = useRef<HTMLCanvasElement>(null);
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  
  // Canvas drawing functionality
  useEffect(() => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Set initial canvas properties
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = activeTool === 'eraser' ? '#1E1E24' : '#ffffff';
    
    const draw = (e: MouseEvent) => {
      if (!isDrawing) return;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };
    
    const startDrawing = (e: MouseEvent) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };
    
    const stopDrawing = () => {
      isDrawing = false;
    };
    
    // Mobile/touch support
    const drawTouch = (e: TouchEvent) => {
      if (!isDrawing || !canvas) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      [lastX, lastY] = [x, y];
    };
    
    const startDrawingTouch = (e: TouchEvent) => {
      if (!canvas) return;
      e.preventDefault();
      
      isDrawing = true;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      [lastX, lastY] = [x, y];
    };
    
    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      
      canvas.removeEventListener('touchstart', startDrawingTouch);
      canvas.removeEventListener('touchmove', drawTouch);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [activeTool]);
  
  const clearWhiteboard = () => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const setToolColor = (color: string) => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = color;
  };
  
  // In a production environment, this would call the OpenAI API to generate a diagram
  const generateDiagram = () => {
    setIsGeneratingWhiteboard(true);
    
    // Simulating API call delay (in production this would be a real API call)
    setTimeout(() => {
      // Simple generated whiteboard background - no fake data
      const defaultWhiteboardBg = "/whiteboard-background.svg";
      
      // Set the basic whiteboard background
      setDiagramUrl(defaultWhiteboardBg);
      setIsGeneratingWhiteboard(false);
      
      // In a real implementation, we would use the AI to identify weak points
      // For now, start with empty array
      setWeakPoints([]);
    }, 1500);
  };
  
  const { data: aiTutor, isLoading: isLoadingTutor } = useQuery({
    queryKey: ['/api/ai/tutor'],
    enabled: !!user,
  });
  
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['/api/ai/conversation/recent'],
    enabled: !!user,
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/ai/tutor/respond", { message });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversation/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
  };
  
  // Track voice interaction state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Auto-start teaching if coming from course page with chapter parameters
  useEffect(() => {
    if (chapterParam && subjectParam && courseParam) {
      // Auto-start teaching with the provided chapter
      toast({
        title: `Loading chapter content`,
        description: `Preparing ${chapterParam} from ${courseParam}`
      });
      
      // Generate the diagram for whiteboard teaching
      generateDiagram();
      
      // Switch to whiteboard tab
      setActiveTab("whiteboard");
    }
  }, [chapterParam, subjectParam, courseParam]);
  
  const handleVoiceInteraction = () => {
    // If already listening, stop listening
    if (isListening) {
      setIsListening(false);
      toast({
        title: "Voice recognition stopped",
        description: "Processing your question..."
      });
      
      // Simulate AI processing time
      setTimeout(() => {
        setIsSpeaking(true);
        toast({
          title: "AI Tutor is speaking",
          description: `${aiTutor?.name || "AI Tutor"} is explaining ${currentTopic}`
        });
        
        // Simulate AI speaking time
        setTimeout(() => {
          setIsSpeaking(false);
        }, 4000);
      }, 1500);
      
      return;
    }
    
    // Start listening
    setIsListening(true);
    toast({
      title: "Voice interaction activated",
      description: "Speak clearly and I'll listen to your questions."
    });
    
    // In a real implementation, this would use the Web Speech API:
    // const recognition = new window.SpeechRecognition();
    // recognition.onresult = (event) => { ... }
    // recognition.start();
  };

  const handlePromptClick = (promptText: string) => {
    setMessage(promptText);
  };
  
  const handleStartTeaching = () => {
    if (!currentTopic.trim()) {
      toast({
        title: "Topic required", 
        description: "Please enter a specific topic to learn about",
        variant: "destructive"
      });
      return;
    }
    
    // In production, this would trigger the AI to generate a teaching session
    toast({
      title: "Starting teaching session",
      description: `Preparing a lesson on ${currentTopic} in ${currentSubject}`
    });
    
    // Generate the diagram for whiteboard teaching
    generateDiagram();
    
    // Switch to whiteboard tab
    setActiveTab("whiteboard");
  };

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-10 bg-gradient-to-b from-cyan-500/70 via-cyan-600/50 to-primary/20"></div>
          <h1 className="text-3xl font-gaming gaming-text text-glow">
            <span className="gradient-text" style={{
              background: "linear-gradient(90deg, #06b6d4, #7d27ff, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
              animation: "gradient-animation 3s linear infinite"
            }}>AI Tutor</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar with AI tutor info */}
          <div className="md:col-span-1">
            <div className="bg-background/50 rounded-xl border border-cyan-500/30 p-6 h-full monarch-card-glow relative">
              {/* Solo Leveling corner decorations */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-500/60"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-500/60"></div>
              
              {isLoadingTutor ? (
                <div className="space-y-4 flex flex-col items-center">
                  <Skeleton className="w-32 h-32 rounded-full bg-cyan-500/10" />
                  <Skeleton className="h-6 w-24 bg-cyan-500/10" />
                  <Skeleton className="h-4 w-36 bg-primary/10" />
                  <Skeleton className="h-24 w-full mt-4 bg-cyan-500/10" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    {/* Solo Leveling energy ring around avatar */}
                    <div className="absolute inset-0 monarch-insignia opacity-70"></div>
                    
                    {/* AI tutor image with Solo Leveling frame */}
                    <div className="absolute inset-0 rounded-full overflow-hidden p-1 bg-gradient-to-br from-cyan-500/50 via-primary/40 to-cyan-500/50">
                      <img 
                        src={aiTutor?.image || "/ai-tutor-placeholder.svg"} 
                        alt={aiTutor?.name || "AI Tutor"} 
                        className="w-full h-full rounded-full object-cover p-0.5 bg-background"
                      />
                    </div>
                    
                    {/* Status indicator with Solo Leveling glow */}
                    <div className="absolute -bottom-2 right-0 bg-cyan-500/80 rounded-full p-1 border-2 border-background shadow-glow">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold mt-5 font-gaming text-glow">
                    {aiTutor?.name || "AI Tutor"}
                  </h2>
                  <p className="text-sm text-cyan-200/70 mt-1 text-center mb-6 border-b border-cyan-500/20 pb-2">
                    {aiTutor?.specialty || "Your Entrance Exam Voice Coach"}
                  </p>
                  
                  <div className="w-full bg-background/60 rounded-lg p-5 text-sm border border-cyan-500/20 monarch-card-glow relative">
                    {/* Solo Leveling corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-8 border-l-2 border-t-2 border-cyan-500/30"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-8 border-r-2 border-b-2 border-primary/30"></div>
                    
                    <h3 className="font-semibold mb-2 font-gaming text-cyan-200">About</h3>
                    <p className="text-cyan-100/80 text-sm">
                      {aiTutor?.description || "I'm your AI entrance exam coach, providing voice-based guidance to help you excel in JEE, NEET, UPSC, CLAT and CUET through personalized explanations."}
                    </p>
                    
                    <h3 className="font-semibold mt-4 mb-2 font-gaming text-cyan-200">Specialties</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-white/90">
                        <div className="bg-cyan-500/10 p-1.5 rounded relative">
                          <GraduationCap className="h-4 w-4 text-cyan-400" />
                          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse rounded"></div>
                        </div>
                        <span>{aiTutor?.subjects?.[0] || "Voice-based JEE/NEET coaching"}</span>
                      </li>
                      <li className="flex items-center gap-3 text-white/90">
                        <div className="bg-primary/10 p-1.5 rounded relative">
                          <Book className="h-4 w-4 text-primary-400" />
                          <div className="absolute inset-0 bg-primary/5 animate-pulse rounded"></div>
                        </div>
                        <span>{aiTutor?.subjects?.[1] || "UPSC/CLAT/CUET whiteboard solutions"}</span>
                      </li>
                      <li className="flex items-center gap-3 text-white/90">
                        <div className="bg-cyan-500/10 p-1.5 rounded relative">
                          <FileCheck className="h-4 w-4 text-cyan-400" />
                          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse rounded"></div>
                        </div>
                        <span>{aiTutor?.subjects?.[2] || "Personalized exam strategies"}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-center gap-3 mt-6">
                    <Button 
                      size="icon" 
                      onClick={handleVoiceInteraction}
                      className="bg-cyan-500/80 hover:bg-cyan-500 text-white relative overflow-hidden"
                    >
                      {/* Solo Leveling button effect */}
                      <div className="absolute inset-0 cyan-aura opacity-0 hover:opacity-30 transition-opacity duration-200"></div>
                      <Mic className="h-4 w-4 relative z-10" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="bg-background/60 hover:bg-background/80 text-white border-cyan-500/30 hover:border-cyan-500/50"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="bg-background/60 hover:bg-background/80 text-white border-primary/30 hover:border-primary/50"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main chat area */}
          <div className="md:col-span-3 flex flex-col">
            <div className="bg-background/50 rounded-xl border border-primary/30 p-6 flex-1 flex flex-col monarch-card-glow relative">
              {/* Solo Leveling corner decorations */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-primary/60"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-primary/60"></div>

              <Tabs defaultValue="whiteboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid grid-cols-2 w-auto bg-background/30 border border-primary/20 p-1">
                    <TabsTrigger 
                      value="whiteboard" 
                      className="text-sm px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-white data-[state=active]:shadow-glow relative overflow-hidden"
                    >
                      {/* Solo Leveling active tab effect */}
                      <div className="absolute inset-0 primary-aura opacity-0 group-data-[state=active]:opacity-20"></div>
                      <PenTool className="h-4 w-4 mr-2" />
                      <span className="relative z-10">Teaching Session</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="performance" 
                      className="text-sm px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-white data-[state=active]:shadow-glow relative overflow-hidden"
                    >
                      {/* Solo Leveling active tab effect */}
                      <div className="absolute inset-0 primary-aura opacity-0 group-data-[state=active]:opacity-20"></div>
                      <BarChart4 className="h-4 w-4 mr-2" />
                      <span className="relative z-10">Progress</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-background/60 hover:bg-background/80 text-white border-primary/30 hover:border-primary/50"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-background/60 hover:bg-background/80 text-white border-primary/30 hover:border-primary/50"
                    >
                      New Session
                    </Button>
                  </div>
                </div>
                
                {/* Chat Tab */}
                <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                  {/* Chat messages */}
                  <div className="bg-dark-card rounded-lg p-4 flex-1 min-h-[400px] overflow-y-auto mb-4">
                    {isLoadingConversation ? (
                      <>
                        <div className="flex items-start space-x-3 mb-4">
                          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                          <div className="w-full">
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                          <div className="w-full">
                            <Skeleton className="h-4 w-16 mb-2" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                          </div>
                        </div>
                      </>
                    ) : conversation && conversation.messages && conversation.messages.length > 0 ? (
                      conversation.messages.map((msg, idx) => (
                        <div key={idx} className="flex items-start space-x-3 mb-6">
                          {msg.role === 'assistant' ? (
                            <>
                              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Robot className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-primary-400 mb-1">{aiTutor?.name || "AI Tutor"}</div>
                                <div className="bg-dark-surface text-gray-200 p-4 rounded-lg border border-dark-border">
                                  {msg.content}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-dark-surface rounded-full flex items-center justify-center flex-shrink-0 border border-dark-border">
                                <UserCircle className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold mb-1">You</div>
                                <div className="bg-primary-900/20 text-gray-200 p-4 rounded-lg">
                                  {msg.content}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Robot className="h-16 w-16 mb-4 text-gray-600" />
                        <p className="text-lg mb-2">Start a conversation with your AI tutor</p>
                        <p className="text-sm text-center max-w-md">
                          Ask questions about any subject, request study materials, or get help with difficult concepts.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Message input */}
                  <form onSubmit={handleSendMessage} className="relative">
                    <Input
                      type="text"
                      placeholder="Ask anything about your studies..."
                      className="w-full bg-dark-card border border-dark-border focus:border-primary-500 rounded-lg py-3 px-4 text-gray-300 focus:outline-none pr-20 h-12"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <Button type="button" size="icon" variant="ghost" className="text-gray-400 hover:text-white transition-colors">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost"
                        onClick={handleVoiceInteraction}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="submit" 
                        size="icon" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={sendMessageMutation.isPending || !message.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                  
                  {/* Quick prompts */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                      onClick={() => handlePromptClick("Create a study plan for my upcoming exams")}
                    >
                      <span className="block font-semibold">Create a study plan</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                      onClick={() => handlePromptClick("Explain the concept of quantum mechanics simply")}
                    >
                      <span className="block font-semibold">Explain quantum mechanics</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                      onClick={() => handlePromptClick("Create practice questions for calculus")}
                    >
                      <span className="block font-semibold">Generate practice questions</span>
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Whiteboard Tab */}
                <TabsContent value="whiteboard" className="flex-1 flex flex-col mt-0">
                  {/* Course info header when opened from a course */}
                  {chapterParam && courseParam && (
                    <div className="mb-4 bg-dark-card rounded-lg p-4 border-l-4 border-primary-600">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <Book className="h-5 w-5 text-primary-400" />
                            <h3 className="text-lg font-bold">{chapterParam}</h3>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">From {courseParam} • {subjectParam}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate('/courses')}
                          className="bg-dark-surface border-dark-border hover:bg-dark-hover"
                        >
                          <ArrowLeftCircle className="h-4 w-4 mr-2" />
                          Back to Course
                        </Button>
                      </div>
                    </div>
                  )}
                
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[500px]">
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <div className="bg-dark-card rounded-lg p-4 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold">Interactive Whiteboard</h3>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={clearWhiteboard} className="h-8 px-2 py-1 text-xs">
                              <Eraser className="h-3 w-3 mr-1" />
                              Clear
                            </Button>
                            <div className="flex items-center gap-1 bg-dark-surface p-1 rounded-md">
                              <Button 
                                size="sm" 
                                variant={activeTool === "pen" ? "default" : "ghost"} 
                                onClick={() => setActiveTool("pen")}
                                className="h-7 w-7 p-0"
                              >
                                <PenTool className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant={activeTool === "eraser" ? "default" : "ghost"} 
                                onClick={() => setActiveTool("eraser")}
                                className="h-7 w-7 p-0"
                              >
                                <Eraser className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative aspect-video w-full bg-[#1E1E24] rounded-lg overflow-hidden">
                          {diagramUrl && (
                            <img 
                              src={diagramUrl} 
                              alt="AI Generated Diagram" 
                              className="absolute top-0 left-0 w-full h-full object-contain opacity-70 z-10" 
                            />
                          )}
                          <canvas 
                            ref={whiteboardRef} 
                            width={800} 
                            height={500} 
                            className="absolute top-0 left-0 w-full h-full z-20"
                          ></canvas>
                          
                          {isGeneratingWhiteboard && (
                            <div className="absolute inset-0 flex items-center justify-center bg-dark-card/80 z-30">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                                <p className="text-gray-300">Generating teaching materials...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="bg-dark-card rounded-lg p-4 flex-1">
                        <div className="flex flex-col gap-4">
                          <h3 className="text-lg font-bold">Teaching Session</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Subject</label>
                              <Select
                                value={currentSubject}
                                onValueChange={(value) => setCurrentSubject(value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mathematics">Mathematics</SelectItem>
                                  <SelectItem value="physics">Physics</SelectItem>
                                  <SelectItem value="chemistry">Chemistry</SelectItem>
                                  <SelectItem value="biology">Biology</SelectItem>
                                  <SelectItem value="computer_science">Computer Science</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-1 block">Topic</label>
                              <Input
                                type="text"
                                placeholder="Enter specific topic (e.g. Calculus, Quantum Physics)"
                                className="w-full bg-dark-surface border border-dark-border focus:border-primary-500"
                                value={currentTopic}
                                onChange={(e) => setCurrentTopic(e.target.value)}
                              />
                            </div>
                            
                            <Button 
                              onClick={handleStartTeaching}
                              className="w-full bg-primary-600 hover:bg-primary-500"
                              disabled={isGeneratingWhiteboard}
                            >
                              {isGeneratingWhiteboard ? (
                                <>Generating... <span className="ml-2 animate-pulse">⏳</span></>
                              ) : (
                                <>Start Teaching Session</>
                              )}
                            </Button>
                          </div>
                          
                          {weakPoints.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-amber-400 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Weak Points Identified
                              </h4>
                              <ul className="mt-2 space-y-2">
                                {weakPoints.map((point, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-dark-card rounded-lg p-4">
                        <h3 className="text-md font-bold mb-2">Voice-First Entrance Exam Tutoring</h3>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img 
                              src={aiTutor?.image || "/ai-tutor-placeholder.svg"} 
                              alt="AI Tutor" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{aiTutor?.name || "AI Tutor"}</p>
                            <p className="text-xs text-gray-400">{aiTutor?.specialty || "Your Learning Assistant"}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-col items-center">
                          <div className="w-full p-3 rounded-lg border border-primary-600/30 bg-dark-surface mb-3">
                            <p className="text-sm text-center text-gray-300">
                              {isGeneratingWhiteboard ? (
                                <span>Preparing teaching materials...</span>
                              ) : diagramUrl ? (
                                <span>I'm teaching you about <span className="text-primary-400 font-medium">{currentTopic}</span> now. Ask me anything!</span>
                              ) : (
                                <span>Select a subject and topic, then start a teaching session</span>
                              )}
                            </p>
                          </div>
                          
                          <Button 
                            onClick={handleVoiceInteraction}
                            size="lg"
                            className={`h-16 w-16 rounded-full relative
                              ${isListening ? 'bg-red-500 hover:bg-red-600' : 
                                isSpeaking ? 'bg-green-500 hover:bg-green-600' : 
                                diagramUrl ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-700'}`}
                            disabled={!diagramUrl || isSpeaking}
                          >
                            {isListening ? (
                              // Listening animation
                              <>
                                <Mic className="h-6 w-6 text-white animate-pulse" />
                                <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></div>
                              </>
                            ) : isSpeaking ? (
                              // Speaking animation 
                              <>
                                <div className="flex items-center justify-center space-x-1">
                                  <div className="w-1 h-3 bg-white animate-sound-wave1"></div>
                                  <div className="w-1 h-5 bg-white animate-sound-wave2"></div>
                                  <div className="w-1 h-3 bg-white animate-sound-wave3"></div>
                                </div>
                              </>
                            ) : (
                              <Mic className={`h-6 w-6 ${diagramUrl ? 'text-white' : 'text-gray-400'}`} />
                            )}
                          </Button>
                          <p className="text-xs text-center mt-2 text-gray-400">
                            {isListening ? "Listening to your question... (click to stop)" : 
                             isSpeaking ? "AI Tutor is explaining your exam topic..." : 
                             diagramUrl ? "Press to ask exam questions by voice" : "Start exam topic session first"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Performance Tab */}
                <TabsContent value="performance" className="flex-1 flex flex-col mt-0">
                  <div className="bg-dark-card rounded-lg p-4 flex-1 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">Learning Progress</h3>
                      <Select defaultValue="last30">
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Time Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last7">Last 7 days</SelectItem>
                          <SelectItem value="last30">Last 30 days</SelectItem>
                          <SelectItem value="last90">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-dark-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400">Total Study Time</p>
                          <MessageSquare className="h-4 w-4 text-primary-400" />
                        </div>
                        <p className="text-2xl font-bold mt-2">0 hrs</p>
                        <p className="text-xs text-gray-500 mt-1">
                          No data available yet
                        </p>
                      </div>
                      
                      <div className="bg-dark-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400">Topics Mastered</p>
                          <Check className="h-4 w-4 text-primary-400" />
                        </div>
                        <p className="text-2xl font-bold mt-2">0</p>
                        <p className="text-xs text-gray-500 mt-1">
                          No data available yet
                        </p>
                      </div>
                      
                      <div className="bg-dark-surface rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400">Practice Questions</p>
                          <FileCheck className="h-4 w-4 text-primary-400" />
                        </div>
                        <p className="text-2xl font-bold mt-2">0</p>
                        <p className="text-xs text-gray-500 mt-1">
                          No data available yet
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center text-sm">
                          <PieChart className="h-4 w-4 mr-2 text-primary-400" />
                          Subject Distribution
                        </h4>
                        <div className="bg-dark-surface rounded-lg p-4 h-40 flex flex-col items-center justify-center text-gray-500">
                          <PieChart className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm text-center">No subject data available yet</p>
                          <p className="text-xs mt-1 text-center">Data will populate as you interact with different subjects</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center text-sm">
                          <BarChart4 className="h-4 w-4 mr-2 text-primary-400" />
                          Improvement Areas
                        </h4>
                        <div className="bg-dark-surface rounded-lg p-4 text-center text-gray-500">
                          <ScanSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No improvement areas identified yet</p>
                          <p className="text-xs mt-1">Data will appear as you use the AI Tutor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}