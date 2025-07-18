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
import { Loader2, Image, BookOpen, Brain, Zap, Download, Share2, GraduationCap, Book, FileCheck, Target, Award, AlertTriangle, Building2 } from "lucide-react";
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

                  {/* Study Session Results */}
                  {results.sessionPlan && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold text-white">{results.sessionPlan.title}</h3>
                        <Badge variant="secondary">{results.estimatedCompletionTime}</Badge>
                      </div>

                      {results.supportingVisual && results.supportingVisual.interactiveDiagram && (
                        <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                          <h4 className="text-cyan-400 font-medium mb-2">Interactive Visual Support</h4>
                          <InteractiveDiagram data={results.supportingVisual.interactiveDiagram} />
                          <p className="text-xs text-slate-400 mt-2">{results.supportingVisual.description}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {results.sessionPlan.sections?.map((section: any, idx: number) => (
                          <div key={idx} className="bg-slate-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-pink-400 font-medium">{section.name}</h4>
                              <Badge variant="outline">{section.duration}</Badge>
                            </div>
                            <p className="text-slate-300 text-sm mb-3">{section.content}</p>
                            {section.keyPoints && (
                              <div>
                                <h5 className="text-xs font-medium text-slate-400 mb-1">Key Points:</h5>
                                <ul className="text-xs text-slate-500 space-y-1">
                                  {section.keyPoints.map((point: string, pointIdx: number) => (
                                    <li key={pointIdx}>• {point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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
      
      </SubscriptionGuard>
      </div>
  );
}