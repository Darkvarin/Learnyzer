import { useState, useRef, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { CanvasRenderer } from "@/components/CanvasRenderer";
import { MCQComponent } from "@/components/MCQComponent";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { useVoice } from "@/hooks/useVoice";
import { useTeachingVoice } from "@/hooks/useTeachingVoice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SubscriptionGuard, useSubscriptionTracking } from "@/components/subscription/subscription-guard";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
// import { TrialLockdown, useTrialStatus } from "@/components/trial/trial-lockdown"; // Replaced with existing SubscriptionGuard
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BackButton } from "@/components/ui/back-button";
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
  
  ArrowLeftCircle,
  BarChart4,
  AlertTriangle,
  Check,
  ImageIcon,
  PenTool,
  PieChart,
  Search as ScanSearch,
  ChevronRight,
  MicOff,
  Volume2,
  VolumeX,
  History,
  Clock,
  Bell,
  Lightbulb,
  BookOpen,
  Play,
  Award,
  Bookmark,
  Zap,
  Target,
  Building2,
  Brain
} from "lucide-react";

export default function AiTutor() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();

  // Get user data for exam selection check
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Check if user has selected an exam
  const userExam = (userData as any)?.selectedExam;
  const examLocked = (userData as any)?.examLocked;

  // State for exam selection modal
  const [showExamModal, setShowExamModal] = useState(false);
  
  // State for chat history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryConversation, setSelectedHistoryConversation] = useState<any>(null);

  // Function to check if user can access AI tools
  const checkExamSelection = () => {
    
    if (!userData) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use AI tools",
        variant: "destructive"
      });
      return false;
    }
    if (!userExam) {
      setShowExamModal(true);
      return false;
    }
    return true;
  };
  
  // Voice functionality
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    isSupported: isVoiceSupported, 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking 
  } = useVoice();

  // Teaching voice functionality - generates intelligent explanations
  const {
    teachConcept,
    stopTeaching,
    isGenerating: isGeneratingTeaching,
    isTeaching,
    error: teachingError,
    lastResponse: lastTeachingResponse
  } = useTeachingVoice();

  // MCQ Generation function
  const generateMCQForMessage = async (messageIndex: number, messageContent: string) => {
    setMcqLoading(prev => ({...prev, [messageIndex]: true}));
    
    try {
      // Get the user's question from conversation context
      const userQuestion = (conversation as any)?.messages?.[messageIndex - 1]?.content || "";
      
      // Extract topic from AI response content using smart analysis
      const contentTopic = extractTopicFromContent(messageContent, userQuestion);
      
      const response = await apiRequest('POST', '/api/ai/mcq/generate', {
        topic: contentTopic,
        subject: currentSubject?.replace('_', ' ') || 'General',
        examType: userExam || 'general',
        difficulty: 'medium',
        questionType: 'mixed',
        // Include context for better question generation
        context: {
          userQuestion: userQuestion,
          aiResponse: messageContent.substring(0, 500), // First 500 chars for context
          conversationTopic: currentTopic
        }
      });

      const mcqData = await response.json();
      setGeneratedMCQs(prev => ({...prev, [messageIndex]: mcqData}));
      setShowMCQForMessage(messageIndex);
    } catch (error) {
      console.error('Error generating MCQ:', error);
      toast({
        title: "Error",
        description: "Failed to generate test question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMcqLoading(prev => ({...prev, [messageIndex]: false}));
    }
  };

  // Helper function to extract topic from AI response content
  const extractTopicFromContent = (messageContent: string, userQuestion: string) => {
    // Try to extract topic from headers, keywords, or user question
    const headers = messageContent.match(/^#+\s*(.+)$/gm);
    if (headers && headers.length > 0) {
      return headers[0].replace(/^#+\s*/, '').trim();
    }
    
    // Look for key concepts in the AI response
    const keywordPatterns = [
      /about\s+(.+?)(?:\.|,|$)/i,
      /concept of\s+(.+?)(?:\.|,|$)/i,
      /formula for\s+(.+?)(?:\.|,|$)/i,
      /theorem of\s+(.+?)(?:\.|,|$)/i,
      /law of\s+(.+?)(?:\.|,|$)/i,
      /principle of\s+(.+?)(?:\.|,|$)/i
    ];
    
    for (const pattern of keywordPatterns) {
      const match = messageContent.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Extract from user question if AI content doesn't have clear topic
    if (userQuestion) {
      const questionTopics = [
        /explain\s+(.+?)(?:\?|$)/i,
        /what is\s+(.+?)(?:\?|$)/i,
        /tell me about\s+(.+?)(?:\?|$)/i,
        /help with\s+(.+?)(?:\?|$)/i,
        /solve\s+(.+?)(?:\?|$)/i
      ];
      
      for (const pattern of questionTopics) {
        const match = userQuestion.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
    
    // Fallback to current topic or subject
    return currentTopic || currentSubject?.replace('_', ' ') || 'Current Topic';
  };
  
  // Parse URL parameters if coming from course page
  const searchParams = new URLSearchParams(window.location.search);
  const subjectParam = searchParams.get('subject');
  const chapterParam = searchParams.get('chapter');
  const courseParam = searchParams.get('course');
  
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [currentSubject, setCurrentSubject] = useState(subjectParam?.toLowerCase() || "jee_mathematics");
  
  // Voice and language settings
  const [voiceLanguage, setVoiceLanguage] = useState<'english' | 'hindi'>('english');
  const [selectedVoice, setSelectedVoice] = useState<'neerja'>('neerja');
  
  // Add ref for auto-scrolling chat
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Subscription tracking
  const { trackFeatureUsage } = useSubscriptionTracking();
  const [currentTopic, setCurrentTopic] = useState(chapterParam || "");
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [weakPoints, setWeakPoints] = useState<string[]>([]); 
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [canvasInstructions, setCanvasInstructions] = useState<any>(null);
  const [showVisual, setShowVisual] = useState(false);
  
  // MCQ state
  const [showMCQForMessage, setShowMCQForMessage] = useState<number | null>(null);
  const [generatedMCQs, setGeneratedMCQs] = useState<{[key: number]: any}>({});
  const [mcqLoading, setMcqLoading] = useState<{[key: number]: boolean}>({});
  
  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);
  

  
  // Canvas display functionality for AI-generated content
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas background
    ctx.fillStyle = "#1E1E24";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // If we have a diagram URL, display the SVG
    if (diagramUrl) {
      const img = new Image();
      img.onload = () => {
        // Clear canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#1E1E24";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate dimensions to maintain aspect ratio
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          // Image is wider than canvas ratio
          drawWidth = canvas.width - 40;
          drawHeight = drawWidth / imgRatio;
          offsetX = 20;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller than canvas ratio
          drawHeight = canvas.height - 40;
          drawWidth = drawHeight * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 20;
        }
        
        // Draw the image with proper positioning
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        // Add a subtle glowing border for Solo Leveling aesthetics
        ctx.strokeStyle = "#00A3FF";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00A3FF";
        ctx.strokeRect(offsetX - 2, offsetY - 2, drawWidth + 4, drawHeight + 4);
        ctx.shadowBlur = 0;
      };
      
      img.onerror = () => {
        // Display error message if image fails to load
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "#FF5555";
        ctx.textAlign = "center";
        ctx.fillText("Error loading diagram", canvas.width/2, canvas.height/2 - 20);
        ctx.fillText("Please try again", canvas.width/2, canvas.height/2 + 20);
      };
      
      // Set the source to the diagram URL
      img.src = diagramUrl;
    } 
    // Show loading message or placeholder when no diagram is present
    else if (!isGeneratingDiagram) {
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "#888888";
      ctx.textAlign = "center";
      ctx.fillText("AI-generated diagram will appear here", canvas.width/2, canvas.height/2 - 20);
      ctx.fillText("Enter a topic and click 'Generate Diagram'", canvas.width/2, canvas.height/2 + 20);
    }
    
    // Draw loading spinner if generating diagram
    if (isGeneratingDiagram) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 30;
      
      // Animation function for loading spinner
      const drawLoadingSpinner = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#1E1E24";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText("Generating AI diagram...", centerX, centerY + 60);
        
        // Draw spinner
        ctx.strokeStyle = "#00A3FF";
        ctx.lineWidth = 5;
        ctx.beginPath();
        const angle = (Date.now() / 500) % (Math.PI * 2);
        ctx.arc(centerX, centerY, radius, angle, angle + Math.PI * 1.5);
        ctx.stroke();
        
        if (isGeneratingDiagram) {
          requestAnimationFrame(drawLoadingSpinner);
        }
      };
      
      drawLoadingSpinner();
    }
  }, [diagramUrl, isGeneratingDiagram]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setMessage(transcript);
      // Auto-send message if voice is enabled and we got a complete transcript
      if (voiceEnabled && transcript.length > 3) {
        handleSendMessage(transcript);
      }
    }
  }, [transcript, isListening]);
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const prepareCanvasForDiagram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Prepare the canvas for displaying the AI-generated diagram
    ctx.fillStyle = "#1E1E24";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  // Call the backend API to generate interactive diagrams and presentations
  const generateDiagram = (topic: string) => {
    if (!topic) {
      toast({
        title: "Please enter an exam topic",
        description: "Enter a specific entrance exam topic like 'JEE Kinematics' or 'UPSC Modern History'",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingDiagram(true);
    
    // Make a request to our backend API to generate a diagram
    const generateAIDiagram = async () => {
      try {
        // Extract the exam type from the subject string (e.g., "jee_physics" → "jee")
        const examType = currentSubject.split('_')[0].toUpperCase();
        
        // Call our backend API to generate the diagram
        const response = await apiRequest('POST', '/api/ai/generate-diagram', {
          subject: currentSubject,
          topic: topic,
          examType: examType
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // For the demo, use our pre-created SVG diagrams based on exam type
          const examLowercase = examType.toLowerCase();
          
          // Check if we have a specific diagram for this exam type, otherwise use a default
          const validExamTypes = ['jee', 'neet', 'upsc', 'clat', 'cuet'];
          const diagramExamType = validExamTypes.includes(examLowercase) ? examLowercase : 'jee';
          
          // Set the diagram URL pointing to our SVG
          setDiagramUrl(`/images/diagram-${diagramExamType}.svg`);
          
          // Set the key points that students often struggle with
          setWeakPoints(data.keyPoints || []);
          
          toast({
            title: "Diagram generated successfully",
            description: "AI has created an interactive explanation for your entrance exam topic",
            variant: "default"
          });
        } else {
          throw new Error("Failed to generate diagram");
        }
      } catch (error) {
        console.error("Error generating diagram:", error);
        
        // Provide a fallback diagram based on the current subject
        const examType = currentSubject.split('_')[0].toLowerCase();
        const fallbackType = ['jee', 'neet', 'upsc'].includes(examType) ? examType : 'jee';
        setDiagramUrl(`/images/diagram-${fallbackType}.svg`);
        
        // Set some default weak points since we couldn't get real ones
        setWeakPoints([
          "Understanding core principles and their applications",
          "Solving multi-step problems that combine different concepts",
          "Visualizing complex processes and their relationships",
          "Applying formulas in different contexts",
          "Connecting theoretical knowledge to practical scenarios"
        ]);
        
        toast({
          title: "Using backup diagram",
          description: "Connected to simplified mode for entrance exam visualization",
          variant: "default"
        });
      } finally {
        setIsGeneratingDiagram(false);
      }
    };
    
    generateAIDiagram();
  };
  
  const { data: aiTutor, isLoading: isLoadingTutor } = useQuery({
    queryKey: ['/api/ai/tutor'],
    enabled: !!user,
  });
  
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['/api/ai/conversation/recent'],
    enabled: !!user,
  });

  // Query for conversation history
  const { data: conversationHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/ai/conversation/history'],
    enabled: !!user && showHistoryModal,
  });

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollContainer = chatContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [conversation]);
  

  
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Track AI chat usage before sending message
      const hasAccess = await trackFeatureUsage("ai_chat", {
        messageLength: message.length,
        subject: currentSubject,
        timestamp: new Date().toISOString()
      });
      
      if (!hasAccess) {
        throw new Error("Usage limit exceeded");
      }
      
      return apiRequest("POST", "/api/ai/tutor/respond", { 
        message,
        subject: currentSubject,
        includeVisuals: true,
        difficulty: "intermediate"
      });
    },
    onSuccess: (data: any) => {
      setMessage("");
      
      // Handle AI response with intelligent teaching voice when enabled
      if (data.response && voiceEnabled) {
        // Use intelligent teaching voice instead of just reading the response
        setTimeout(() => {
          teachConcept({
            userMessage: message,
            aiResponse: data.response,
            subject: currentSubject
          }, {
            voicePreference: selectedVoice,
            language: voiceLanguage
          });
        }, 500);
      }
      
      // Handle Canvas visual instructions if available
      if (data.visualSuggestions && data.visualSuggestions.drawingInstructions) {
        const instructions = {
          title: data.visualSuggestions.title || "Educational Diagram",
          canvasWidth: 800,
          canvasHeight: 600,
          backgroundColor: "#1E1E24",
          elements: data.visualSuggestions.drawingInstructions.map((instruction: any) => ({
            type: instruction.type,
            x: instruction.x,
            y: instruction.y,
            x1: instruction.x1,
            y1: instruction.y1,
            x2: instruction.x2,
            y2: instruction.y2,
            text: instruction.content,
            fontSize: instruction.fontSize,
            color: instruction.color,
            radius: instruction.radius,
            width: instruction.width,
            height: instruction.height,
            fillColor: instruction.fillColor,
            strokeColor: instruction.strokeColor,
            strokeWidth: instruction.strokeWidth
          }))
        };
        
        setCanvasInstructions(instructions);
        setShowVisual(true);
        
        // Auto-switch to canvas tab if visual is generated
        setTimeout(() => {
          setActiveTab("canvas");
        }, 1000);
        
        toast({
          title: "Visual diagram generated",
          description: "Check the Canvas tab to see the AI-generated diagram",
        });
      }
      
      // Note: Rewards are now only shown when students correctly answer quiz questions
      
      // Refresh conversation data and auto-scroll to bottom
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversation/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/rank'] });
      
      // Auto-scroll to bottom after a brief delay for DOM update
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    },
    onError: (error: any) => {
      console.error("AI tutor error:", error);
      const errorMessage = error.message || "Unknown error";
      
      // Check for 403 exam-specific subject validation error
      if (error.status === 403 || errorMessage.includes("not available for") || errorMessage.includes("exam preparation")) {
        toast({
          title: "Subject Restricted",
          description: errorMessage.length > 100 ? errorMessage.substring(0, 97) + "..." : errorMessage,
          variant: "destructive",
        });
      } else if (errorMessage.includes("Usage limit exceeded")) {
        toast({
          title: "Daily Limit Reached",
          description: "You've reached your daily AI chat limit. Upgrade your plan for unlimited access!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to send message",
          description: "There was an error sending your message. Please try again later.",
          variant: "destructive",
        });
      }
    }
  });

  const handleSendMessage = (messageText?: string) => {
    const msgToSend = messageText || message;
    if (!msgToSend.trim()) return;
    
    // Check if user has selected an exam before allowing AI tool usage
    if (!checkExamSelection()) {
      return;
    }
    
    sendMessageMutation.mutate(msgToSend);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  // Voice interaction functions
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleTextToSpeech = (text: string) => {
    if (voiceEnabled && text) {
      speak(text);
    }
  };

  const handleVoiceInteraction = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  // Auto-start teaching if coming from course page with chapter parameters
  useEffect(() => {
    if (chapterParam && subjectParam && courseParam) {
      // Auto-start teaching with the provided chapter
      toast({
        title: `Loading chapter content`,
        description: `Preparing ${chapterParam} from ${courseParam}`
      });
      
      // Generate the diagram for AI canvas presentation
      if (subjectParam && chapterParam) {
        setCurrentTopic(`${subjectParam} ${chapterParam}`);
        generateDiagram(`${subjectParam} ${chapterParam}`);
      }
      
      // Switch to canvas tab
      setActiveTab("canvas");
    }
  }, [chapterParam, subjectParam, courseParam]);
  
  // Removed automatic TTS - user now has full control over when speech starts
  
  // Cleanup TTS when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Stop any ongoing speech when leaving the page
      stopSpeaking();
      stopTeaching();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePromptClick = (promptText: string) => {
    // Check if user has selected an exam before allowing AI tool usage
    if (!checkExamSelection()) {
      return;
    }
    
    setMessage(promptText);
    
    // Add a slight delay before sending to let the UI update
    setTimeout(() => {
      // Send the message
      sendMessageMutation.mutate(promptText);
      
      // Show a toast notification
      toast({
        title: "Question submitted",
        description: "Processing your entrance exam question..."
      });
      
      // Switch to the chat tab to see the response
      setActiveTab("chat");
    }, 300);
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
    
    toast({
      title: "Starting entrance exam session",
      description: `Preparing interactive content for ${currentTopic} in ${currentSubject.replace('_', ' ')}`
    });
    
    // Generate the diagram for AI canvas presentation
    generateDiagram(currentTopic);
    
    // Switch to canvas tab
    setActiveTab("canvas");
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
      
      <SubscriptionGuard featureType="ai_tutor_session">
        <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6 relative z-10">
        {/* Back button */}
        <div className="mb-4">
          <BackButton fallbackPath="/dashboard" className="text-white hover:text-cyan-400" />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-gradient-to-b from-cyan-500/70 via-cyan-600/50 to-primary/20"></div>
            <h1 className="text-3xl font-gaming gaming-text text-glow">
              <span className="gradient-text" style={{
                background: "linear-gradient(90deg, #ff0000, #ffff00, #00ff00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
                animation: "gradient-animation 3s linear infinite"
              }}>AI Entrance Exam Tutor</span>
            </h1>
          </div>
          
          {/* Exam Lock Status */}
          {examLocked && userExam && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">
                {userExam.toUpperCase()} Locked
              </span>
            </div>
          )}
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
                        src={(aiTutor as any)?.image || "/ai-tutor-placeholder.svg"} 
                        alt={(aiTutor as any)?.name || "AI Tutor"} 
                        className="w-full h-full rounded-full object-cover p-0.5 bg-background"
                      />
                    </div>
                    
                    {/* Status indicator with Solo Leveling glow */}
                    <div className="absolute -bottom-2 right-0 bg-cyan-500/80 rounded-full p-1 border-2 border-background shadow-glow">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold mt-5 font-gaming text-glow">
                    {(aiTutor as any)?.name || "AI Tutor"}
                  </h2>
                  <p className="text-sm text-cyan-200/70 mt-1 text-center mb-6 border-b border-cyan-500/20 pb-2">
                    {(aiTutor as any)?.specialty || "Your Entrance Exam Voice Coach"}
                  </p>
                  
                  <div className="w-full bg-background/60 rounded-lg p-5 text-sm border border-cyan-500/20 monarch-card-glow relative">
                    {/* Solo Leveling corner accents */}
                    <div className="absolute top-0 left-0 w-2 h-8 border-l-2 border-t-2 border-cyan-500/30"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-8 border-r-2 border-b-2 border-primary/30"></div>
                    
                    <h3 className="font-semibold mb-2 font-gaming text-cyan-200">About</h3>
                    <p className="text-cyan-100/80 text-sm leading-relaxed">
                      {(aiTutor as any)?.description || 
                        "Expert AI tutor for JEE, NEET, UPSC, CLAT, CUET, CSE & CGLE. Provides voice-based teaching with interactive diagrams and personalized study strategies."
                      }
                    </p>
                    
                    <div className="mt-4 p-3 bg-cyan-500/5 rounded-md border border-cyan-500/20">
                      <h4 className="font-medium text-cyan-300 text-xs mb-2 flex items-center">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                        EXPERT CAPABILITIES
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-cyan-100/70">
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">•</span>
                          <span>Voice Teaching</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">•</span>
                          <span>Visual Diagrams</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">•</span>
                          <span>Study Plans</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">•</span>
                          <span>Concept Analysis</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mt-4 mb-2 font-gaming text-cyan-200">Specialties</h3>
                    <ul className="space-y-3">
                      <li 
                        className="flex items-center gap-3 text-white/90 cursor-pointer hover:bg-cyan-500/10 p-2 rounded-md transition-colors"
                        onClick={() => {
                          toast({
                            title: "JEE/NEET Expertise",
                            description: "Expert guidance in Physics, Chemistry, Biology and Mathematics for JEE and NEET exam preparation."
                          });
                          setActiveTab("canvas");
                          setCurrentTopic("JEE Physics concepts");
                        }}
                      >
                        <div className="bg-cyan-500/10 p-1.5 rounded relative">
                          <GraduationCap className="h-4 w-4 text-cyan-400" />
                          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse rounded"></div>
                        </div>
                        <span>{(aiTutor as any)?.subjects?.[0] || "Interactive JEE/NEET diagrams & presentations"}</span>
                        <ChevronRight className="h-4 w-4 text-cyan-400 ml-auto" />
                      </li>
                      <li 
                        className="flex items-center gap-3 text-white/90 cursor-pointer hover:bg-primary/10 p-2 rounded-md transition-colors"
                        onClick={() => {
                          toast({
                            title: "UPSC/CLAT/CUET/CSE Expertise",
                            description: "Visual concept explanations for UPSC, CLAT, CUET and CSE with advanced diagram generation."
                          });
                          setActiveTab("canvas");
                          setCurrentTopic("UPSC current affairs analysis");
                        }}
                      >
                        <div className="bg-primary/10 p-1.5 rounded relative">
                          <Book className="h-4 w-4 text-primary-400" />
                          <div className="absolute inset-0 bg-primary/5 animate-pulse rounded"></div>
                        </div>
                        <span>{(aiTutor as any)?.subjects?.[1] || "UPSC/CLAT/CUET/CSE visual concept explanations"}</span>
                        <ChevronRight className="h-4 w-4 text-primary-400 ml-auto" />
                      </li>
                      <li 
                        className="flex items-center gap-3 text-white/90 cursor-pointer hover:bg-cyan-500/10 p-2 rounded-md transition-colors"
                        onClick={() => {
                          toast({
                            title: "Voice-Based Coaching",
                            description: "Interactive voice-based coaching with personalized exam strategies and feedback."
                          });
                          setActiveTab("chat");
                          handleVoiceInteraction();
                        }}
                      >
                        <div className="bg-cyan-500/10 p-1.5 rounded relative">
                          <FileCheck className="h-4 w-4 text-cyan-400" />
                          <div className="absolute inset-0 bg-cyan-500/5 animate-pulse rounded"></div>
                        </div>
                        <span>{(aiTutor as any)?.subjects?.[2] || "Voice-based coaching for all entrance exams"}</span>
                        <ChevronRight className="h-4 w-4 text-cyan-400 ml-auto" />
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-6">
                    {/* Primary Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm"
                        onClick={() => {
                          setActiveTab("chat");
                          handleVoiceInteraction();
                          toast({
                            title: "Voice Mode Activated",
                            description: "Start speaking your entrance exam questions!"
                          });
                        }}
                        className="bg-gradient-to-r from-cyan-500/80 to-cyan-600/80 hover:from-cyan-500 hover:to-cyan-600 text-white relative overflow-hidden"
                      >
                        <div className="absolute inset-0 cyan-aura opacity-0 hover:opacity-30 transition-opacity duration-200"></div>
                        <Mic className="h-4 w-4 mr-2 relative z-10" />
                        <span className="relative z-10 font-medium">Voice Chat</span>
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="bg-background/60 hover:bg-background/80 text-white border-cyan-500/30 hover:border-cyan-500/50"
                        onClick={() => {
                          setActiveTab("chat");
                          toast({
                            title: "Text Chat Active",
                            description: "Type your questions below for detailed explanations"
                          });
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="font-medium">Text Chat</span>
                      </Button>
                    </div>
                    
                    {/* Secondary Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="bg-primary/10 hover:bg-primary/20 text-primary-300 border-primary/30 hover:border-primary/50"
                        onClick={() => {
                          navigate('/ai-visual-lab');
                          toast({
                            title: "Visual Learning Lab",
                            description: "Creating diagrams and visual explanations..."
                          });
                        }}
                      >
                        <PenTool className="h-4 w-4 mr-2" />
                        <span className="font-medium">Visual Lab</span>
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-500/50"
                        onClick={() => {
                          setActiveTab("performance");
                          toast({
                            title: "Performance Analytics",
                            description: "View your learning progress and exam preparation stats"
                          });
                        }}
                      >
                        <BarChart4 className="h-4 w-4 mr-2" />
                        <span className="font-medium">Progress</span>
                      </Button>
                    </div>
                    
                    {/* Quick Start Button */}
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500/80 to-green-600/80 hover:from-emerald-500 hover:to-green-600 text-white flex-1"
                        onClick={() => {
                          setActiveTab("chat");
                          setMessage("Create a personalized study plan for my upcoming exams");
                          toast({
                            title: "Quick Start Session",
                            description: "Let's create your personalized study plan!"
                          });
                        }}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        <span className="font-medium">Start Study Session</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Add CSS for tooltips */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    .tooltip-wrapper {
                      position: relative;
                    }
                    .tooltip-text {
                      visibility: hidden;
                      position: absolute;
                      z-index: 1;
                      bottom: 125%;
                      left: 50%;
                      transform: translateX(-50%);
                      background-color: rgba(15, 23, 42, 0.9);
                      color: white;
                      text-align: center;
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-size: 12px;
                      white-space: nowrap;
                      transition: opacity 0.3s;
                      opacity: 0;
                      pointer-events: none;
                      border: 1px solid rgba(34, 211, 238, 0.2);
                    }
                    .tooltip-wrapper:hover .tooltip-text {
                      visibility: visible;
                      opacity: 1;
                    }
                  `}} />
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

              <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="grid grid-cols-2 w-auto bg-background/30 border border-primary/20 p-1">
                    <TabsTrigger 
                      value="canvas" 
                      className="text-sm px-4 data-[state=active]:bg-primary/20 data-[state=active]:text-white data-[state=active]:shadow-glow relative overflow-hidden"
                      onClick={() => {
                        // Auto-navigate to Visual Labs when this tab is selected
                        toast({
                          title: "Opening Visual Learning Lab",
                          description: "Redirecting to advanced visual content generation..."
                        });
                        setTimeout(() => navigate('/ai-visual-lab'), 1000);
                      }}
                    >
                      {/* Solo Leveling active tab effect */}
                      <div className="absolute inset-0 primary-aura opacity-0 group-data-[state=active]:opacity-20"></div>
                      <PenTool className="h-4 w-4 mr-2" />
                      <span className="relative z-10">Visual Learning Lab</span>
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
                    {/* Voice Controls - Compact Header Version */}
                    <div className="flex items-center gap-2 bg-background/40 rounded-lg px-3 py-1.5 border border-primary/20">
                      {/* Language Toggle */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setVoiceLanguage('english')}
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            voiceLanguage === 'english'
                              ? 'bg-cyan-500/30 text-cyan-100'
                              : 'text-cyan-400 hover:text-cyan-300'
                          }`}
                          title="English Mode"
                        >
                          🇬🇧
                        </button>
                        <button
                          onClick={() => setVoiceLanguage('hindi')}
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            voiceLanguage === 'hindi'
                              ? 'bg-orange-500/30 text-orange-100'
                              : 'text-orange-400 hover:text-orange-300'
                          }`}
                          title="Hindi Mode - हिंदी"
                        >
                          🇮🇳
                        </button>
                      </div>
                      
                      <div className="w-px h-4 bg-primary/20"></div>
                      
                      {/* Voice Enable/Disable */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setVoiceEnabled(!voiceEnabled)}
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            voiceEnabled
                              ? 'bg-green-500/30 text-green-100'
                              : 'bg-red-500/30 text-red-300'
                          }`}
                          title={voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
                        >
                          {voiceEnabled ? '🔊' : '🔇'}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-background/60 hover:bg-background/80 text-white border-primary/30 hover:border-primary/50"
                      onClick={() => setShowHelpModal(true)}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-background/60 hover:bg-background/80 text-white border-primary/30 hover:border-primary/50"
                      onClick={async () => {
                        try {
                          console.log('Starting new conversation...');
                          
                          // Clear conversation by creating a new one
                          const response = await apiRequest('POST', '/api/ai/conversation/new');
                          console.log('New conversation response:', response);
                          
                          // Invalidate and refetch conversation
                          await queryClient.invalidateQueries({ queryKey: ['/api/ai/conversation/recent'] });
                          console.log('Queries invalidated successfully');
                          
                          toast({
                            title: "New Session Started",
                            description: "Chat history cleared. Fresh start with your AI tutor!",
                            duration: 2000
                          });
                        } catch (error) {
                          console.error('Error starting new session:', error);
                          toast({
                            title: "Error",
                            description: "Failed to start new session. Please try again.",
                            variant: "destructive",
                            duration: 3000
                          });
                        }
                      }}
                    >
                      New Session
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-background/60 hover:bg-background/80 text-white border-primary/30 hover:border-primary/50"
                      onClick={() => setShowHistoryModal(true)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>
                  </div>
                </div>
                
                {/* Chat Tab */}
                <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
                  {/* Chat messages */}
                  <div 
                    ref={chatContainerRef}
                    className="bg-dark-card rounded-lg p-4 flex-1 min-h-[400px] max-h-[500px] overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                  >
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
                    ) : conversation && (conversation as any).messages && (conversation as any).messages.length > 0 ? (
                      (conversation as any).messages.map((msg: any, idx: any) => (
                        <div key={idx} className="flex items-start space-x-3 mb-6">
                          {msg.role === 'assistant' ? (
                            <>
                              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Robot className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-primary-400 mb-1">{(aiTutor as any)?.name || "AI Tutor"}</div>
                                <div className="bg-dark-surface text-gray-200 p-4 rounded-lg border border-dark-border">
                                  <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-200 prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-black/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/50 prose-pre:border prose-pre:border-cyan-500/20 prose-blockquote:border-l-cyan-500/50 prose-blockquote:bg-cyan-500/5 prose-blockquote:text-cyan-100 prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkGfm, remarkMath]}
                                      rehypePlugins={[rehypeKatex]}
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                
                                {/* Test Knowledge Button for AI responses */}
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateMCQForMessage(idx, msg.content)}
                                    disabled={mcqLoading[idx] || showMCQForMessage === idx}
                                    className="bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30 h-8 px-3 text-xs"
                                  >
                                    {mcqLoading[idx] ? (
                                      <>Generating... <span className="ml-1 animate-pulse">🧠</span></>
                                    ) : showMCQForMessage === idx ? (
                                      <>Question Ready <Check className="h-3 w-3 ml-1" /></>
                                    ) : (
                                      <>Test Knowledge <Brain className="h-3 w-3 ml-1" /></>
                                    )}
                                  </Button>
                                </div>

                                {/* Show MCQ Component if generated - placed right after the Test Knowledge button */}
                                {showMCQForMessage === idx && generatedMCQs[idx] && (
                                  <div className="mt-4 bg-dark-surface/50 rounded-lg p-4 border border-green-500/30">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Brain className="h-4 w-4 text-green-400" />
                                      <span className="text-sm font-semibold text-green-400">Test Your Knowledge</span>
                                    </div>
                                    <MCQComponent
                                      question={generatedMCQs[idx].question}
                                      options={generatedMCQs[idx].options}
                                      correctAnswer={generatedMCQs[idx].correct_answer}
                                      explanation={generatedMCQs[idx].explanation}
                                      topic={currentTopic || 'Current Topic'}
                                      subject={currentSubject?.replace('_', ' ') || 'General'}
                                      onComplete={(isCorrect) => {
                                        if (isCorrect) {
                                          toast({
                                            title: "Excellent!",
                                            description: "You're mastering the concept. Keep going!",
                                          });
                                        } else {
                                          toast({
                                            title: "Learning Opportunity", 
                                            description: "Review the explanation and try similar questions.",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                  {voiceEnabled && (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => teachConcept({
                                          userMessage: (conversation as any).messages[idx - 1]?.content || "",
                                          aiResponse: msg.content,
                                          subject: currentSubject
                                        }, {
                                          voicePreference: selectedVoice,
                                          language: voiceLanguage
                                        })}
                                        disabled={isGeneratingTeaching}
                                        className="text-xs bg-primary-500/10 border-primary-500/30 text-primary-300 hover:bg-primary-500/20"
                                      >
                                        {isGeneratingTeaching ? (
                                          <>
                                            <div className="w-3 h-3 mr-1 border border-primary-400 border-t-transparent rounded-full animate-spin" />
                                            Generating...
                                          </>
                                        ) : isTeaching ? (
                                          <>
                                            <VolumeX className="h-3 w-3 mr-1" />
                                            Stop Teaching
                                          </>
                                        ) : (
                                          <>
                                            <Volume2 className="h-3 w-3 mr-1" />
                                            Teach Me
                                          </>
                                        )}
                                      </Button>

                                    </div>
                                  )}
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
                  <form onSubmit={handleFormSubmit} className="relative">
                    <Input
                      type="text"
                      placeholder={isListening ? "Listening... speak your question" : "Ask anything about your studies..."}
                      className="w-full bg-dark-card border border-dark-border focus:border-primary-500 rounded-lg py-3 px-4 text-gray-300 focus:outline-none pr-24 h-12"
                      value={isListening ? transcript : message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending || isListening}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={() => {
                          toast({
                            title: "Attach files to your question",
                            description: "Upload images or documents related to entrance exam questions",
                          });
                        }}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost"
                        onClick={handleVoiceInput}
                        className={`transition-colors ${
                          isListening 
                            ? 'text-red-400 hover:text-red-300' 
                            : isVoiceSupported 
                              ? 'text-gray-400 hover:text-white' 
                              : 'text-gray-600 cursor-not-allowed'
                        }`}
                        disabled={!isVoiceSupported}
                        title={isListening ? 'Stop listening' : 'Start voice input'}
                      >
                        <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
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
                  
                  {/* Voice Status - Minimal footer */}
                  {isVoiceSupported && (isSpeaking || isTeaching || isListening) && (
                    <div className="mt-4 bg-dark-card/50 rounded-lg p-2 border border-primary/20">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          {isListening && (
                            <div className="flex items-center gap-1">
                              <Mic className="h-3 w-3 text-red-400 animate-pulse" />
                              <span>Listening...</span>
                            </div>
                          )}
                          {(isSpeaking || isTeaching) && (
                            <div className="flex items-center gap-1">
                              <Volume2 className="h-3 w-3 text-green-400" />
                              <span>{isTeaching ? 'Teaching...' : 'Speaking...'}</span>
                              <span className="text-cyan-300">(Akira • {voiceLanguage})</span>
                            </div>
                          )}
                        </div>
                        {(isSpeaking || isTeaching) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (isTeaching) {
                                stopTeaching();
                              } else {
                                stopSpeaking();
                              }
                            }}
                            className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 h-6 px-2 text-xs"
                          >
                            <VolumeX className="h-3 w-3 mr-1" />
                            Stop
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {/* Interactive Canvas Tab */}
                <TabsContent value="canvas" className="flex-1 flex flex-col mt-0">
                  {/* Check if user has selected an exam before showing AI tools */}
                  {!userExam ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-dark-card rounded-xl border border-red-500/30 p-8">
                      <div className="text-center space-y-4">
                        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto" />
                        <h3 className="text-xl font-bold text-red-400">Exam Selection Required</h3>
                        <p className="text-gray-400 max-w-md">
                          To access AI tutoring features and prevent misuse, please select your target entrance exam first. 
                          This ensures focused, exam-specific content.
                        </p>
                        <Button
                          onClick={() => checkExamSelection()}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50"
                        >
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Choose Your Exam
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                          <h3 className="text-lg font-bold">Interactive Canvas & Presentations</h3>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => generateDiagram(currentTopic)} className="h-8 px-3 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Generate Diagram
                            </Button>
                          </div>
                        </div>
                        
                        <div className="relative aspect-video w-full bg-[#1E1E24] rounded-lg overflow-hidden">
                          {canvasInstructions && showVisual ? (
                            <div className="w-full h-full">
                              <CanvasRenderer 
                                instructions={canvasInstructions}
                                className="w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <div className="text-center">
                                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">AI-generated diagrams will appear here</p>
                                <p className="text-xs mt-1">Ask a question in the chat to generate visuals</p>
                              </div>
                            </div>
                          )}
                          
                          {sendMessageMutation.isPending && (
                            <div className="absolute inset-0 flex items-center justify-center bg-dark-card/80 z-30">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                                <p className="text-gray-300">Generating AI visual explanation...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="bg-dark-card rounded-lg p-4 flex-1">
                        <div className="flex flex-col gap-4">
                          <h3 className="text-lg font-bold">Entrance Exam Session</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block text-amber-400">Entrance Exam Subject</label>
                              <Select
                                value={currentSubject}
                                onValueChange={(value) => setCurrentSubject(value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {/* JEE/NEET subjects */}
                                  <SelectItem value="jee_mathematics">JEE Mathematics</SelectItem>
                                  <SelectItem value="jee_physics">JEE Physics</SelectItem>
                                  <SelectItem value="jee_chemistry">JEE Chemistry</SelectItem>
                                  <SelectItem value="neet_biology">NEET Biology</SelectItem>
                                  <SelectItem value="neet_chemistry">NEET Chemistry</SelectItem>
                                  <SelectItem value="neet_physics">NEET Physics</SelectItem>
                                  
                                  {/* UPSC subjects */}
                                  <SelectItem value="upsc_history">UPSC History</SelectItem>
                                  <SelectItem value="upsc_geography">UPSC Geography</SelectItem>
                                  <SelectItem value="upsc_polity">UPSC Polity</SelectItem>
                                  <SelectItem value="upsc_economics">UPSC Economics</SelectItem>
                                  <SelectItem value="upsc_environment">UPSC Environment</SelectItem>
                                  
                                  {/* CLAT subjects */}
                                  <SelectItem value="clat_legal_reasoning">CLAT Legal Reasoning</SelectItem>
                                  <SelectItem value="clat_logical_reasoning">CLAT Logical Reasoning</SelectItem>
                                  <SelectItem value="clat_english">CLAT English</SelectItem>
                                  <SelectItem value="clat_current_affairs">CLAT Current Affairs</SelectItem>
                                  
                                  {/* CUET subjects */}
                                  <SelectItem value="cuet_general_test">CUET General Test</SelectItem>
                                  <SelectItem value="cuet_domain_subjects">CUET Domain Subjects</SelectItem>
                                  <SelectItem value="cuet_languages">CUET Languages</SelectItem>
                                  
                                  {/* CSE subjects */}
                                  <SelectItem value="cse_programming">CSE Programming</SelectItem>
                                  <SelectItem value="cse_data_structures">CSE Data Structures</SelectItem>
                                  <SelectItem value="cse_algorithms">CSE Algorithms</SelectItem>
                                  <SelectItem value="cse_computer_networks">CSE Computer Networks</SelectItem>
                                  <SelectItem value="cse_operating_systems">CSE Operating Systems</SelectItem>
                                  <SelectItem value="cse_database_systems">CSE Database Systems</SelectItem>
                                  <SelectItem value="cse_software_engineering">CSE Software Engineering</SelectItem>
                                  <SelectItem value="cse_system_design">CSE System Design</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium mb-1 block text-amber-400">Exam Topic</label>
                              <Input
                                type="text"
                                placeholder="Enter exam topic (e.g. JEE Kinematics, UPSC Modern History)"
                                className="w-full bg-dark-surface border border-dark-border focus:border-primary-500"
                                value={currentTopic}
                                onChange={(e) => setCurrentTopic(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Button 
                                onClick={handleStartTeaching}
                                className="w-full bg-primary-600 hover:bg-primary-500"
                                disabled={isGeneratingDiagram}
                              >
                                {isGeneratingDiagram ? (
                                  <>Generating... <span className="ml-2 animate-pulse">⏳</span></>
                                ) : (
                                  <>Generate Interactive Content</>
                                )}
                              </Button>
                              
                              <Button 
                                onClick={() => {
                                  toast({
                                    title: "Opening Visual Learning Lab",
                                    description: "Access advanced visual content generation tools"
                                  });
                                  navigate('/ai-visual-lab');
                                }}
                                variant="outline"
                                className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 text-purple-300 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30"
                              >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Open Visual Learning Lab
                              </Button>
                            </div>
                          </div>
                          
                          {weakPoints.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-amber-400 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Key Exam Concepts
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
                        <h3 className="text-md font-bold mb-2 text-gradient-primary">Voice-First Entrance Exam Tutoring</h3>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img 
                              src={(aiTutor as any)?.image || "/ai-tutor-placeholder.svg"} 
                              alt="AI Tutor" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{(aiTutor as any)?.name || "AI Tutor"}</p>
                            <p className="text-xs text-gray-400">{(aiTutor as any)?.specialty || "Your Learning Assistant"}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-col items-center">
                          <div className="w-full p-3 rounded-lg border border-primary-600/30 bg-dark-surface mb-3">
                            <p className="text-sm text-center text-gray-300">
                              {isGeneratingDiagram ? (
                                <span>Preparing exam content...</span>
                              ) : diagramUrl ? (
                                <span>I'm coaching you on <span className="text-primary-400 font-medium">{currentTopic}</span> now. Ask exam questions!</span>
                              ) : (
                                <span>Select an exam subject and topic, then generate interactive content</span>
                              )}
                            </p>
                          </div>
                          
                          <Button 
                            onClick={handleVoiceInput}
                            size="lg"
                            className={`h-16 w-16 rounded-full relative
                              ${isListening ? 'bg-red-500 hover:bg-red-600' : 
                                isSpeaking ? 'bg-green-500 hover:bg-green-600' : 
                                isVoiceSupported ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-700'}`}
                            disabled={!isVoiceSupported || isSpeaking}
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
                    </>
                  )}
                </TabsContent>
                
                {/* Performance Tab */}
                <TabsContent value="performance" className="flex-1 flex flex-col mt-0">
                  <div className="bg-dark-card rounded-lg p-4 flex-1 min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">Learning Progress</h3>
                      <Select 
                        defaultValue="last30"
                        onValueChange={(value) => {
                          toast({
                            title: "Time period changed",
                            description: `Showing data for ${
                              value === "last7" ? "last 7 days" : 
                              value === "last30" ? "last 30 days" : 
                              "last 90 days"
                            }`
                          });
                          // In a future implementation, this would fetch data for the selected time period
                        }}
                      >
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
          {/* Exam Selection Modal */}
          <Dialog open={showExamModal} onOpenChange={setShowExamModal}>
        <DialogContent className="bg-dark-card border border-dark-border">
          <DialogHeader>
            <DialogTitle className="text-gradient-primary">Choose Your Entrance Exam</DialogTitle>
            <DialogDescription className="text-gray-400">
              To use AI learning tools and prevent misuse, please select your target entrance exam first. This ensures focused, exam-specific content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  navigate('/profile');
                  setShowExamModal(false);
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                JEE Main/Advanced
              </Button>
              <Button
                onClick={() => {
                  navigate('/profile');
                  setShowExamModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Book className="h-4 w-4 mr-2" />
                NEET
              </Button>
              <Button
                onClick={() => {
                  navigate('/profile');
                  setShowExamModal(false);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                UPSC
              </Button>
              <Button
                onClick={() => {
                  navigate('/profile');
                  setShowExamModal(false);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                CLAT
              </Button>
              <Button
                onClick={() => {
                  navigate('/profile');
                  setShowExamModal(false);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                CUET
              </Button>
              <Button
                onClick={() => {
                  navigate('/profile');
                  setShowExamModal(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Award className="h-4 w-4 mr-2" />
                CSE
              </Button>
              <Button
                onClick={() => {
                  navigate('/profile');
                  setShowExamModal(false);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Building2 className="h-4 w-4 mr-2" />
                CGLE
              </Button>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowExamModal(false)}
                className="border-dark-border text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-dark-card border-dark-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <History className="h-5 w-5" />
              Chat History
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Browse your previous conversations with the AI tutor
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-4 h-[600px]">
            {/* History List */}
            <div className="w-1/3 border-r border-dark-border pr-4">
              <h3 className="font-semibold mb-3 text-white">Previous Conversations</h3>
              <div className="space-y-2 overflow-y-auto max-h-[550px]">
                {isLoadingHistory ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-dark-surface border border-dark-border">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))
                ) : conversationHistory && conversationHistory.length > 0 ? (
                  conversationHistory.map((conv: any) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedHistoryConversation?.id === conv.id
                          ? 'bg-primary-600/20 border-primary-500'
                          : 'bg-dark-surface border-dark-border hover:bg-dark-hover'
                      }`}
                      onClick={() => setSelectedHistoryConversation(conv)}
                    >
                      <div className="font-medium text-white text-sm mb-1">
                        {conv.title || 'Untitled Conversation'}
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {conv.subject || 'General'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No chat history found</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Conversation Preview */}
            <div className="w-2/3 pl-4">
              {selectedHistoryConversation ? (
                <div className="h-full flex flex-col">
                  <div className="mb-4 pb-3 border-b border-dark-border">
                    <h3 className="font-semibold text-white">
                      {selectedHistoryConversation.title || 'Untitled Conversation'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {selectedHistoryConversation.subject} • {new Date(selectedHistoryConversation.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {(() => {
                      try {
                        const messagesString = selectedHistoryConversation.messages;
                        if (!messagesString || messagesString.trim() === '') {
                          return [];
                        }
                        const parsedMessages = JSON.parse(messagesString);
                        return Array.isArray(parsedMessages) ? parsedMessages : [];
                      } catch (error) {
                        console.error('Error parsing conversation messages:', error, selectedHistoryConversation.messages);
                        return [];
                      }
                    })().length > 0 ? (() => {
                      try {
                        const messagesString = selectedHistoryConversation.messages;
                        const parsedMessages = JSON.parse(messagesString);
                        return Array.isArray(parsedMessages) ? parsedMessages : [];
                      } catch (error) {
                        return [];
                      }
                    })().map((msg: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3">
                        {msg.role === 'assistant' ? (
                          <>
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Robot className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-primary-400 mb-1">AI Tutor</div>
                              <div className="bg-dark-surface text-gray-200 p-3 rounded-lg border border-dark-border text-sm">
                                <div className="prose prose-invert prose-sm max-w-none">
                                  <ReactMarkdown 
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                                
                                {/* Test Knowledge Button for AI responses */}
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateMCQForMessage(idx, msg.content)}
                                    disabled={mcqLoading[idx] || showMCQForMessage === idx}
                                    className="bg-green-600/20 border-green-500/50 text-green-300 hover:bg-green-600/30 h-8 px-3 text-xs"
                                  >
                                    {mcqLoading[idx] ? (
                                      <>Generating... <span className="ml-1 animate-pulse">🧠</span></>
                                    ) : showMCQForMessage === idx ? (
                                      <>Question Ready <Check className="h-3 w-3 ml-1" /></>
                                    ) : (
                                      <>Test Knowledge <Brain className="h-3 w-3 ml-1" /></>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Show MCQ Component if generated */}
                            {showMCQForMessage === idx && generatedMCQs[idx] && (
                              <div className="ml-13 mt-4">
                                <MCQComponent
                                  question={generatedMCQs[idx].question}
                                  options={generatedMCQs[idx].options}
                                  correctAnswer={generatedMCQs[idx].correct_answer}
                                  explanation={generatedMCQs[idx].explanation}
                                  topic={currentTopic || 'Current Topic'}
                                  subject={currentSubject?.replace('_', ' ') || 'General'}
                                  onComplete={(isCorrect) => {
                                    if (isCorrect) {
                                      toast({
                                        title: "Excellent!",
                                        description: "You're mastering the concept. Keep going!",
                                      });
                                    } else {
                                      toast({
                                        title: "Learning Opportunity",
                                        description: "Review the explanation and try similar questions.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-dark-surface rounded-full flex items-center justify-center flex-shrink-0 border border-dark-border">
                              <UserCircle className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold mb-1 text-white">You</div>
                              <div className="bg-primary-900/20 text-gray-200 p-3 rounded-lg text-sm">
                                {msg.content}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )) : (
                      <div className="text-center text-gray-400 py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>This conversation has no messages</p>
                        <p className="text-xs mt-1">The conversation data might be corrupted or empty</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to view its history</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-5 w-5 text-primary-400" />
              How to Use AI Tutor - Quick Guide
            </DialogTitle>
            <DialogDescription>
              Comprehensive guide to using all AI tutor features for effective learning
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 text-sm">
            {/* Basic Usage */}
            <div>
              <h3 className="font-semibold text-primary-400 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Basic Chat Features
              </h3>
              <ul className="space-y-2 text-gray-300 ml-6">
                <li>• Ask any question about your {user?.track?.toUpperCase() || 'exam'} subjects</li>
                <li>• Get step-by-step explanations with formulas and examples</li>
                <li>• Request study materials, notes, and practice problems</li>
                <li>• The AI remembers your conversation within each session</li>
              </ul>
            </div>

            {/* Voice Features */}
            <div>
              <h3 className="font-semibold text-primary-400 mb-2 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voice & Audio Features
              </h3>
              <ul className="space-y-2 text-gray-300 ml-6">
                <li>• <strong>Voice Input:</strong> Click the microphone button to speak your questions</li>
                <li>• <strong>Teaching Voice:</strong> Click "Teach Me" for intelligent audio explanations</li>
                <li>• <strong>Voice Settings:</strong> Toggle voice on/off, choose English or Hindi</li>
                <li>• Voice is optimized for Indian accent and educational content</li>
              </ul>
            </div>

            {/* Interactive Features */}
            <div>
              <h3 className="font-semibold text-primary-400 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Interactive Learning
              </h3>
              <ul className="space-y-2 text-gray-300 ml-6">
                <li>• <strong>Test Knowledge:</strong> Generate quiz questions after learning concepts</li>
                <li>• <strong>Canvas Tab:</strong> View AI-generated diagrams and visual explanations</li>
                <li>• <strong>Quick Prompts:</strong> Use preset buttons for common study requests</li>
                <li>• Earn XP and rank points for correct quiz answers</li>
              </ul>
            </div>

            {/* Exam-Specific */}
            <div>
              <h3 className="font-semibold text-primary-400 mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Exam-Specific Content
              </h3>
              <ul className="space-y-2 text-gray-300 ml-6">
                <li>• Content is filtered based on your selected entrance exam</li>
                <li>• {user?.track === 'neet' ? 'NEET students can access: Physics, Chemistry, Biology' : 
                     user?.track === 'jee' ? 'JEE students can access: Physics, Chemistry, Mathematics' :
                     user?.track === 'upsc' ? 'UPSC students can access: History, Geography, Political Science, etc.' :
                     'Content varies by exam type'}</li>
                <li>• AI provides exam-specific tips, formulas, and question patterns</li>
                <li>• Study materials align with latest syllabus and exam trends</li>
              </ul>
            </div>

            {/* Pro Tips */}
            <div>
              <h3 className="font-semibold text-primary-400 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Pro Tips for Better Learning
              </h3>
              <ul className="space-y-2 text-gray-300 ml-6">
                <li>• Be specific: "Explain Newton's second law with examples" vs "Physics help"</li>
                <li>• Ask for practice: "Generate 5 problems on quadratic equations"</li>
                <li>• Request visuals: "Show me a diagram of the human heart"</li>
                <li>• Test yourself: Always use "Test Knowledge" after learning new concepts</li>
                <li>• Use voice features for hands-free studying and better retention</li>
              </ul>
            </div>

            {/* Session Management */}
            <div>
              <h3 className="font-semibold text-primary-400 mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                Session Management
              </h3>
              <ul className="space-y-2 text-gray-300 ml-6">
                <li>• <strong>New Session:</strong> Clear chat and start fresh topic</li>
                <li>• <strong>History:</strong> View and restore previous conversations</li>
                <li>• Each session maintains context for better learning flow</li>
                <li>• Switch between Chat and Canvas tabs as needed</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setShowHelpModal(false)} className="bg-primary-600 hover:bg-primary-700">
              Got it, let's start learning!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </main>
      </SubscriptionGuard>
    </div>
  );
}
