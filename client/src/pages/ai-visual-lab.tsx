import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BackButton } from "@/components/ui/back-button";
import { Loader2, Image, BookOpen, Brain, Zap, Download, Share2, GraduationCap, Book, FileCheck, Target, Award, AlertTriangle, Building2, HelpCircle, Lightbulb, Users, Clock, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { SubscriptionGuard, useSubscriptionTracking } from "@/components/subscription/subscription-guard";
import { CanvasRenderer } from "@/components/CanvasRenderer";
import { InteractiveDiagram } from "@/components/InteractiveDiagram";
import ReactMarkdown from 'react-markdown';
// import { TrialLockdown } from "@/components/trial/trial-lockdown"; // Replaced with existing SubscriptionGuard

export default function AIVisualLab() {
  const [activeTab, setActiveTab] = useState("image");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    examType: "",
    style: "diagram",
    difficulty: "intermediate",
    duration: 30,
    includeImage: true,
    includeDiagram: true,
    includeQuiz: true,
    includeVisuals: true
  });
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // State for exam selection modal
  const [showExamModal, setShowExamModal] = useState(false);
  
  // State for help modal
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Subscription tracking
  const { trackFeatureUsage } = useSubscriptionTracking();

  // Get user data for exam selection check
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Check if user has selected an exam
  const userExam = (userData as any)?.selectedExam;

  // Function to check if user can access AI tools
  const checkExamSelection = () => {
    console.log('Checking exam selection in Visual Lab:', { userData, userExam, isAuthenticated: !!userData });
    if (!userData) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use AI tools",
        variant: "destructive"
      });
      return false;
    }
    if (!userExam) {
      console.log('No exam selected, showing modal');
      setShowExamModal(true);
      return false;
    }
    return true;
  };

  // Filter exam types based on user's selected exam if locked
  const examLocked = (userData as any)?.examLocked;

  // Get exam-specific subjects based on locked exam
  const getSubjectsForExam = (examType: string) => {
    const examSubjects: Record<string, string[]> = {
      jee: ["Physics", "Chemistry", "Mathematics"],
      neet: ["Physics", "Chemistry", "Biology"],
      upsc: ["History", "Geography", "Political Science", "Economics", "Current Affairs", "Public Administration", "Sociology", "Philosophy"],
      clat: ["English", "Current Affairs", "Legal Reasoning", "Logical Reasoning", "Quantitative Techniques"],
      cuet: ["English", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "Political Science", "Economics"],
      cse: ["Computer Science", "Programming", "Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Computer Networks"],
      cgle: ["General Awareness", "Quantitative Aptitude", "English Language", "Reasoning"]
    };
    return examSubjects[examType] || [];
  };

  // Filter subjects based on user's locked exam
  const subjects = examLocked && userExam 
    ? getSubjectsForExam(userExam.toLowerCase())
    : [
        "Physics", "Chemistry", "Mathematics", "Biology", "History", 
        "Geography", "Political Science", "Economics", "English", "Current Affairs", "Computer Science"
      ];

  // Filter exam types based on user's locked exam
  const allExamTypes = [
    "JEE Main", "JEE Advanced", "NEET", "UPSC", "CLAT", "CUET", "CSE", "CGLE",
    "GATE", "NDA", "CDS", "SSC", "Banking"
  ];
  
  const examTypes = examLocked && userExam 
    ? allExamTypes.filter(exam => exam.toLowerCase().includes(userExam.toLowerCase()))
    : allExamTypes;

  const styles = [
    { value: "diagram", label: "Educational Diagram" },
    { value: "illustration", label: "Concept Illustration" },
    { value: "chart", label: "Information Chart" },
    { value: "concept_map", label: "Concept Map" },
    { value: "infographic", label: "Infographic" }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateImage = async () => {
    // Check if user has selected an exam before allowing AI tool usage
    if (!checkExamSelection()) {
      return;
    }

    if (!formData.topic || !formData.subject) {
      toast({
        title: "Missing Information",
        description: "Please provide both topic and subject",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Track feature usage
      await trackFeatureUsage("ai_visual_lab");
      
      const response = await apiRequest("POST", "/api/ai/generate-image", {
        topic: formData.topic,
        subject: formData.subject,
        style: formData.style,
        examType: formData.examType
      });

      const responseData = await response.json();
      console.log("Image generation response:", responseData);
      console.log("Image URL:", responseData.imageUrl);
      console.log("Response keys:", Object.keys(responseData));
      setResults(responseData);
      toast({
        title: "Diagram Generated!",
        description: "Your educational diagram has been created successfully"
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateVisualPackage = async () => {
    // Check if user has selected an exam before allowing AI tool usage
    if (!checkExamSelection()) {
      return;
    }

    if (!formData.topic || !formData.subject) {
      toast({
        title: "Missing Information",
        description: "Please provide both topic and subject",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/visual-package", {
        topic: formData.topic,
        subject: formData.subject,
        examType: formData.examType,
        includeImage: formData.includeImage,
        includeDiagram: formData.includeDiagram,
        includeQuiz: formData.includeQuiz
      });

      const responseData = await response.json();
      setResults(responseData);
      toast({
        title: "Visual Package Created!",
        description: `Generated ${(response as any).totalComponents || 'multiple'} learning components`
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate visual package",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStudySession = async () => {
    // Check if user has selected an exam before allowing AI tool usage
    if (!checkExamSelection()) {
      return;
    }

    if (!formData.topic || !formData.subject) {
      toast({
        title: "Missing Information",
        description: "Please provide both topic and subject",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/study-session", {
        topic: formData.topic,
        subject: formData.subject,
        duration: formData.duration,
        difficulty: formData.difficulty,
        includeVisuals: formData.includeVisuals
      });

      const responseData = await response.json();
      setResults(responseData);
      toast({
        title: "Study Session Ready!",
        description: `${formData.duration}-minute interactive session created`
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate study session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <MobileNavigation />
      
      <SubscriptionGuard featureType="ai_visual_lab">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 to-purple-600/20 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent,transparent)]"></div>
        <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8 relative">
          {/* Back button */}
          <div className="mb-4">
            <BackButton fallbackPath="/dashboard" className="text-white hover:text-cyan-400" />
          </div>
          <div className="text-center relative">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-white text-center">
                AI Visual Learning Lab
                <span className="text-cyan-400 ml-2">✨</span>
              </h1>
              
              {/* Help Button */}
              <Button
                onClick={() => setShowHelpModal(true)}
                variant="outline"
                size="sm"
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/30 mt-2 sm:mt-0"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Features Guide
              </Button>
              
              {/* Exam Lock Status */}
              {examLocked && userExam && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg mt-2 sm:mt-0">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">
                    {userExam.toUpperCase()} Locked
                  </span>
                </div>
              )}
            </div>
            <p className="text-cyan-100 text-sm sm:text-lg max-w-2xl mx-auto px-2 sm:px-0">
              Create immersive educational content with GPT-4o and interactive diagrams. 
              Generate engaging visuals, comprehensive study materials, and interactive learning experiences.
            </p>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Input Panel */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-400" />
                Learning Content Generator
              </CardTitle>
              <CardDescription className="text-slate-300">
                Powered by GPT-4o and interactive diagrams for immersive education
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Topic *
                  </label>
                  <Input
                    placeholder="e.g., Photosynthesis, Newton's Laws, French Revolution"
                    value={formData.topic}
                    onChange={(e) => handleInputChange("topic", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Subject *
                    </label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Exam Type {examLocked && userExam && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-2">
                          Locked: {userExam.toUpperCase()}
                        </span>
                      )}
                    </label>
                    <Select 
                      value={formData.examType} 
                      onValueChange={(value) => handleInputChange("examType", value)}
                      disabled={examLocked && userExam}
                    >
                      <SelectTrigger className={`bg-slate-700/50 border-slate-600 text-white ${examLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {examTypes.map(exam => (
                          <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Generation Options */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-slate-700/50 h-auto sm:h-10">
                  <TabsTrigger value="image" className="data-[state=active]:bg-cyan-600 justify-start h-12 sm:h-auto">
                    <Image className="h-4 w-4 mr-2" />
                    Educational Diagram
                  </TabsTrigger>
                  <TabsTrigger value="package" className="data-[state=active]:bg-purple-600 justify-start h-12 sm:h-auto">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Complete Package
                  </TabsTrigger>
                  <TabsTrigger value="session" className="data-[state=active]:bg-pink-600 justify-start h-12 sm:h-auto">
                    <Zap className="h-4 w-4 mr-2" />
                    Study Session
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Visual Style
                    </label>
                    <Select value={formData.style} onValueChange={(value) => handleInputChange("style", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map(style => (
                          <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generateImage}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Image className="h-4 w-4 mr-2" />}
                    Generate Educational Diagram
                  </Button>
                </TabsContent>

                <TabsContent value="package" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Package Components</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={formData.includeImage}
                          onChange={(e) => handleInputChange("includeImage", e.target.checked)}
                          className="rounded"
                        />
                        <span>Interactive Educational Diagram</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={formData.includeDiagram}
                          onChange={(e) => handleInputChange("includeDiagram", e.target.checked)}
                          className="rounded"
                        />
                        <span>Interactive SVG Diagram</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={formData.includeQuiz}
                          onChange={(e) => handleInputChange("includeQuiz", e.target.checked)}
                          className="rounded"
                        />
                        <span>Practice Quiz</span>
                      </label>
                    </div>
                  </div>

                  <Button 
                    onClick={generateVisualPackage}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
                    Generate Complete Package
                  </Button>
                </TabsContent>

                <TabsContent value="session" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">
                        Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        min="15"
                        max="120"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">
                        Difficulty
                      </label>
                      <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.includeVisuals}
                      onChange={(e) => handleInputChange("includeVisuals", e.target.checked)}
                      className="rounded"
                    />
                    <span>Include Visual Support</span>
                  </label>

                  <Button 
                    onClick={generateStudySession}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
                  >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Generate Study Session
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="h-5 w-5 text-cyan-400" />
                Generated Content
              </CardTitle>
              <CardDescription className="text-slate-300">
                AI-powered educational materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
                    <p className="text-slate-300">Creating your learning materials...</p>
                  </div>
                </div>
              ) : results ? (
                <div className="space-y-6">
                  {console.log("Rendering results:", results)}
                  {/* Canvas Diagram Results */}
                  {results.canvasInstructions && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Educational Diagram</h3>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-slate-600"
                            onClick={() => {
                              const canvas = document.querySelector('canvas');
                              if (canvas) {
                                const link = document.createElement('a');
                                link.href = canvas.toDataURL();
                                link.download = `${results.topic || 'educational-diagram'}.png`;
                                link.click();
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-slate-600"
                            onClick={() => {
                              const canvas = document.querySelector('canvas');
                              if (canvas) {
                                canvas.toBlob((blob) => {
                                  if (blob) {
                                    const url = URL.createObjectURL(blob);
                                    navigator.clipboard.writeText(url);
                                    toast({
                                      title: "Diagram Copied!",
                                      description: "Diagram copied to clipboard"
                                    });
                                  }
                                });
                              }
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-slate-600 bg-white p-4">
                        <CanvasRenderer 
                          instructions={results.canvasInstructions}
                          className="w-full"
                        />
                      </div>
                      {results.explanation && (
                        <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                          <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Educational Explanation
                          </h4>
                          <div className="text-slate-200 text-base leading-relaxed space-y-3">
                            {results.explanation.split('\n').map((paragraph: string, idx: number) => (
                              paragraph.trim() && (
                                <p key={idx} className="text-slate-200">
                                  {paragraph}
                                </p>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Package Results */}
                  {results.packageComponents && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-white">Learning Package</h3>
                        <Badge variant="secondary">{results.totalComponents} components</Badge>
                      </div>

                      {results.interactiveDiagram && (
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h4 className="text-cyan-400 font-medium mb-2">Interactive Diagram</h4>
                          <InteractiveDiagram data={results.interactiveDiagram} />
                        </div>
                      )}

                      {results.comprehensiveGuide && (
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h4 className="text-purple-400 font-medium mb-2">Study Guide</h4>
                          <div className="text-slate-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{results.comprehensiveGuide}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {results.practiceQuiz && results.practiceQuiz.questions && (
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h4 className="text-green-400 font-medium mb-3">Practice Quiz</h4>
                          <div className="space-y-3">
                            {results.practiceQuiz.questions.map((q: any, idx: number) => (
                              <div key={idx} className="border border-slate-600 rounded-lg p-3">
                                <p className="text-white font-medium mb-2">Q{idx + 1}: {q.question}</p>
                                <div className="space-y-1 mb-2">
                                  {q.options.map((option: string, optIdx: number) => (
                                    <p key={optIdx} className={`text-sm ${optIdx === q.correct ? 'text-green-400' : 'text-slate-400'}`}>
                                      {option}
                                    </p>
                                  ))}
                                </div>
                                <p className="text-xs text-slate-500">{q.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enhanced Interactive Study Session Results */}
                  {results.sessionPlan && (
                    <div className="space-y-6">
                      {/* Session Header */}
                      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white">{results.sessionPlan.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              <Clock className="h-3 w-3 mr-1" />
                              {results.sessionPlan.duration} min
                            </Badge>
                            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                              {results.estimatedDifficulty || "Medium"}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Opening Hook */}
                        {results.sessionPlan.openingHook && (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="h-4 w-4 text-amber-400" />
                              <h4 className="font-medium text-amber-300">Session Hook</h4>
                            </div>
                            <p className="text-amber-100 text-sm">{results.sessionPlan.openingHook}</p>
                          </div>
                        )}

                        {/* Learning Objectives */}
                        {results.sessionPlan.learningObjectives && (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-green-400" />
                              <h4 className="font-medium text-green-300">Learning Objectives</h4>
                            </div>
                            <ul className="space-y-1">
                              {results.sessionPlan.learningObjectives.map((objective: string, idx: number) => (
                                <li key={idx} className="text-green-100 text-sm flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Supporting Visual */}
                      {results.supportingVisual && results.supportingVisual.interactiveDiagram && (
                        <div className="bg-slate-700/30 rounded-xl p-6 border border-cyan-500/30">
                          <div className="flex items-center gap-2 mb-4">
                            <Image className="h-5 w-5 text-cyan-400" />
                            <h4 className="text-cyan-400 font-medium">Interactive Visual Support</h4>
                          </div>
                          <InteractiveDiagram data={results.supportingVisual.interactiveDiagram} />
                          <p className="text-slate-400 text-sm mt-3">{results.supportingVisual.description}</p>
                        </div>
                      )}

                      {/* Session Timeline */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Clock className="h-5 w-5 text-cyan-400" />
                          Interactive Session Timeline
                        </h4>
                        
                        {results.sessionPlan.sections?.map((section: any, idx: number) => (
                          <div key={idx} className={`relative rounded-xl p-6 border ${
                            section.type === 'interactive_learning' ? 'bg-blue-500/10 border-blue-500/30' :
                            section.type === 'practice' ? 'bg-green-500/10 border-green-500/30' :
                            section.type === 'assessment' ? 'bg-purple-500/10 border-purple-500/30' :
                            'bg-slate-700/30 border-slate-600'
                          }`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  section.type === 'interactive_learning' ? 'bg-blue-500 text-white' :
                                  section.type === 'practice' ? 'bg-green-500 text-white' :
                                  section.type === 'assessment' ? 'bg-purple-500 text-white' :
                                  'bg-slate-500 text-white'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <h5 className="font-medium text-white">{section.name}</h5>
                                  <p className="text-xs text-slate-400">{section.timeRange || section.duration}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {section.type?.replace('_', ' ') || 'Learning'}
                              </Badge>
                            </div>
                            
                            <div className="text-slate-200 text-sm leading-relaxed mb-4">
                              <ReactMarkdown>{section.content}</ReactMarkdown>
                            </div>

                            {/* Interactive Elements */}
                            {section.interactiveElements && (
                              <div className="space-y-3 mb-4">
                                <h6 className="text-xs font-medium text-cyan-300 uppercase tracking-wide">Interactive Activities</h6>
                                {section.interactiveElements.map((element: any, elemIdx: number) => (
                                  <div key={elemIdx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                    <div className="flex items-center gap-2 mb-2">
                                      {element.type === 'question' && <Target className="h-4 w-4 text-yellow-400" />}
                                      {element.type === 'exercise' && <BookOpen className="h-4 w-4 text-green-400" />}
                                      {element.type === 'visualization' && <Image className="h-4 w-4 text-purple-400" />}
                                      {element.type === 'story' && <Lightbulb className="h-4 w-4 text-orange-400" />}
                                      <span className="text-xs font-medium text-slate-300 capitalize">{element.type}</span>
                                    </div>
                                    <p className="text-slate-200 text-sm mb-2">{element.content}</p>
                                    {element.feedback && (
                                      <div className="bg-slate-900/50 rounded p-2 border-l-2 border-cyan-400">
                                        <p className="text-cyan-300 text-xs">{element.feedback}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Visual Description */}
                            {section.visualDescription && (
                              <div className="bg-purple-500/10 rounded-lg p-3 mb-4 border border-purple-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Image className="h-4 w-4 text-purple-400" />
                                  <span className="text-xs font-medium text-purple-300">Visual Guide</span>
                                </div>
                                <p className="text-purple-100 text-xs">{section.visualDescription}</p>
                              </div>
                            )}

                            {/* Key Takeaways */}
                            {section.keyTakeaways && (
                              <div>
                                <h6 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  Key Takeaways
                                </h6>
                                <ul className="space-y-1">
                                  {section.keyTakeaways.map((takeaway: string, takeawayIdx: number) => (
                                    <li key={takeawayIdx} className="text-slate-300 text-xs flex items-start gap-2">
                                      <span className="text-cyan-400 mt-1">✓</span>
                                      {takeaway}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Memory Techniques */}
                      {results.sessionPlan.memoryTechniques && (
                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30">
                          <div className="flex items-center gap-2 mb-4">
                            <Brain className="h-5 w-5 text-amber-400" />
                            <h4 className="font-medium text-amber-300">Memory Techniques</h4>
                          </div>
                          <div className="grid gap-3">
                            {results.sessionPlan.memoryTechniques.map((technique: string, idx: number) => (
                              <div key={idx} className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/20">
                                <p className="text-amber-100 text-sm">{technique}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exam Strategies */}
                      {results.sessionPlan.examStrategies && (
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30">
                          <div className="flex items-center gap-2 mb-4">
                            <Zap className="h-5 w-5 text-green-400" />
                            <h4 className="font-medium text-green-300">Exam Strategies & Shortcuts</h4>
                          </div>
                          <div className="grid gap-3">
                            {results.sessionPlan.examStrategies.map((strategy: string, idx: number) => (
                              <div key={idx} className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                                <p className="text-green-100 text-sm">{strategy}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Assessment */}
                      {results.sessionPlan.assessmentQuestions && (
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                          <div className="flex items-center gap-2 mb-4">
                            <FileCheck className="h-5 w-5 text-purple-400" />
                            <h4 className="font-medium text-purple-300">Quick Assessment</h4>
                          </div>
                          <div className="space-y-4">
                            {results.sessionPlan.assessmentQuestions.map((q: any, idx: number) => (
                              <div key={idx} className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/20">
                                <p className="text-white font-medium mb-3">Q{idx + 1}: {q.question}</p>
                                <div className="grid gap-2 mb-3">
                                  {q.options?.map((option: string, optIdx: number) => (
                                    <div key={optIdx} className={`p-2 rounded text-sm border ${
                                      optIdx === q.correct ? 
                                        'bg-green-500/20 border-green-500/30 text-green-300' : 
                                        'bg-slate-700/30 border-slate-600 text-slate-400'
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}. {option}
                                    </div>
                                  ))}
                                </div>
                                <div className="bg-slate-800/50 rounded p-3 border-l-2 border-green-400">
                                  <p className="text-green-300 text-xs font-medium mb-1">Explanation:</p>
                                  <p className="text-slate-300 text-xs">{q.explanation}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Steps */}
                      {results.nextRecommendations && (
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/30">
                          <div className="flex items-center gap-2 mb-4">
                            <GraduationCap className="h-5 w-5 text-cyan-400" />
                            <h4 className="font-medium text-cyan-300">What's Next?</h4>
                          </div>
                          <ul className="space-y-2">
                            {results.nextRecommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-cyan-100 text-sm flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">→</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generate content to see results here</p>
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Help Features Guide Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="bg-dark-card border border-dark-border max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-primary flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Visual Learning Lab - Complete Features Guide
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Master all the powerful features available in your AI Visual Learning Lab
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Educational Diagram Feature */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Image className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Interactive Educational Diagrams</h3>
              </div>
              <div className="space-y-2 text-slate-300 text-sm">
                <p><strong>What it creates:</strong> Interactive SVG diagrams with clickable elements, tooltips, and detailed explanations</p>
                <p><strong>Visual styles:</strong> Flowcharts, mind maps, concept maps, process diagrams, scientific illustrations</p>
                <p><strong>Features:</strong> Download as PNG, share with friends, clickable elements for deeper learning</p>
                <p><strong>Best for:</strong> Understanding complex processes, scientific concepts, mathematical relationships</p>
              </div>
            </div>

            {/* Complete Learning Package */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Complete Learning Package</h3>
              </div>
              <div className="space-y-2 text-slate-300 text-sm">
                <p><strong>What it creates:</strong> Comprehensive study package with multiple components</p>
                <div className="ml-4 space-y-1">
                  <p>• <strong>Interactive Diagrams:</strong> Visual learning with clickable elements</p>
                  <p>• <strong>Study Guides:</strong> Detailed explanations and key concepts</p>
                  <p>• <strong>Practice Quizzes:</strong> Test your understanding with instant feedback</p>
                </div>
                <p><strong>Best for:</strong> Complete topic mastery, exam preparation, comprehensive understanding</p>
              </div>
            </div>

            {/* Interactive Study Session */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Interactive Study Session</h3>
              </div>
              <div className="space-y-2 text-slate-300 text-sm">
                <p><strong>What it creates:</strong> Structured learning session with time-based sections</p>
                <div className="ml-4 space-y-1">
                  <p>• <strong>Introduction (5 min):</strong> Learning objectives and topic overview</p>
                  <p>• <strong>Core Content (60%):</strong> Main concepts with examples and explanations</p>
                  <p>• <strong>Practice (25%):</strong> Interactive exercises and questions</p>
                  <p>• <strong>Review (10%):</strong> Summary and key takeaways</p>
                </div>
                <p><strong>Duration:</strong> 15-120 minutes (customizable)</p>
                <p><strong>Includes:</strong> Visual support diagrams, memory techniques, exam tips</p>
                <p><strong>Best for:</strong> Focused study sessions, time-managed learning, structured preparation</p>
              </div>
            </div>

            {/* Exam-Specific Features */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Exam-Specific Content Filtering</h3>
              </div>
              <div className="space-y-2 text-slate-300 text-sm">
                <p><strong>Supported Exams:</strong> JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE</p>
                <p><strong>Smart Filtering:</strong> Content automatically adapts to your selected entrance exam</p>
                <div className="ml-4 space-y-1">
                  <p>• <strong>JEE:</strong> Physics, Chemistry, Mathematics only</p>
                  <p>• <strong>NEET:</strong> Physics, Chemistry, Biology only</p>
                  <p>• <strong>UPSC:</strong> History, Geography, Political Science, Economics, etc.</p>
                  <p>• <strong>CLAT:</strong> Legal Reasoning, English, General Knowledge, etc.</p>
                </div>
                <p><strong>Benefits:</strong> No distractions, focused preparation, exam-relevant content only</p>
              </div>
            </div>

            {/* AI-Powered Features */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Advanced AI Capabilities</h3>
              </div>
              <div className="space-y-2 text-slate-300 text-sm">
                <p><strong>GPT-4o Integration:</strong> Latest AI model for highest quality educational content</p>
                <div className="ml-4 space-y-1">
                  <p>• <strong>Adaptive Difficulty:</strong> Beginner, Intermediate, Advanced levels</p>
                  <p>• <strong>Indian Context:</strong> Examples and explanations relevant to Indian students</p>
                  <p>• <strong>Real-world Applications:</strong> Connect theory to practical applications</p>
                  <p>• <strong>Memory Techniques:</strong> Mnemonics and memory aids for better retention</p>
                </div>
                <p><strong>Personalization:</strong> Content adapts to your learning level and progress</p>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Pro Tips for Maximum Learning</h3>
              </div>
              <div className="space-y-2 text-slate-300 text-sm">
                <p>• <strong>Start with Diagrams:</strong> Visual learning helps understand complex concepts faster</p>
                <p>• <strong>Use Complete Packages:</strong> Combine visuals, guides, and quizzes for comprehensive learning</p>
                <p>• <strong>Schedule Study Sessions:</strong> Use timed sessions for focused, productive learning</p>
                <p>• <strong>Practice Regularly:</strong> Use practice quizzes to test and reinforce your knowledge</p>
                <p>• <strong>Download & Share:</strong> Save diagrams for offline study and share with study groups</p>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <h4 className="font-medium text-white">Usage & Subscription</h4>
              </div>
              <div className="text-slate-300 text-sm space-y-1">
                <p>• <strong>Free Trial:</strong> Limited daily usage to try all features</p>
                <p>• <strong>Pro Subscription:</strong> Unlimited access to all AI Visual Lab features</p>
                <p>• <strong>Exam Lock Required:</strong> Select your target exam in profile settings first</p>
                <p>• <strong>Quality Guaranteed:</strong> All content powered by GPT-4o for best educational value</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-700">
            <Button 
              onClick={() => setShowHelpModal(false)}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            >
              Got it! Let's Learn
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      </SubscriptionGuard>
      </div>
  );
}