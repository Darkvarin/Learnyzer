import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Image, BookOpen, Brain, Zap, Download, Share2, GraduationCap, Book, FileCheck, Target, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

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

  // Get user data for exam selection check
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Check if user has selected an exam
  const userExam = (userData as any)?.selectedExam;

  // Function to check if user can access AI tools
  const checkExamSelection = () => {
    if (!userExam) {
      setShowExamModal(true);
      return false;
    }
    return true;
  };

  // Get user data for exam filtering
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Filter exam types based on user's selected exam if locked
  const examLocked = (user as any)?.examLocked;

  const subjects = [
    "Physics", "Chemistry", "Mathematics", "Biology", "History", 
    "Geography", "Political Science", "Economics", "English", "Current Affairs", "Computer Science"
  ];

  // Filter exam types based on user's locked exam
  const allExamTypes = [
    "JEE Main", "JEE Advanced", "NEET", "UPSC", "CLAT", "CUET", "CSE",
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
      const response = await apiRequest("POST", "/api/ai/generate-image", {
        topic: formData.topic,
        subject: formData.subject,
        style: formData.style,
        examType: formData.examType
      });

      setResults(response);
      toast({
        title: "Image Generated!",
        description: "Your educational image has been created successfully"
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

      setResults(response);
      toast({
        title: "Visual Package Created!",
        description: `Generated ${response.totalComponents} learning components`
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

      setResults(response);
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
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 to-purple-600/20 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent,transparent)]"></div>
        <div className="container mx-auto px-6 py-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI Visual Learning Lab
              <span className="text-cyan-400 ml-2">✨</span>
            </h1>
            <p className="text-cyan-100 text-lg max-w-2xl mx-auto">
              Create immersive educational content with GPT-4o and DALL-E 3. 
              Generate stunning visuals, comprehensive study materials, and interactive learning experiences.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-400" />
                Learning Content Generator
              </CardTitle>
              <CardDescription className="text-slate-300">
                Powered by GPT-4o and DALL-E 3 for immersive education
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
                  <TabsTrigger value="image" className="data-[state=active]:bg-cyan-600">
                    <Image className="h-4 w-4 mr-2" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger value="package" className="data-[state=active]:bg-purple-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Package
                  </TabsTrigger>
                  <TabsTrigger value="session" className="data-[state=active]:bg-pink-600">
                    <Zap className="h-4 w-4 mr-2" />
                    Session
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
                    Generate Educational Image
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
                        <span>DALL-E 3 Educational Image</span>
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
                  <div className="grid grid-cols-2 gap-4">
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
                  {/* Image Results */}
                  {results.imageUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Educational Image</h3>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-slate-600">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-slate-600">
                        <img 
                          src={results.imageUrl} 
                          alt={`Educational content for ${results.topic}`}
                          className="w-full h-auto"
                        />
                      </div>
                      {results.explanation && (
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-cyan-400 mb-2">Explanation</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{results.explanation}</p>
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

                      {results.educationalImage && (
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h4 className="text-cyan-400 font-medium mb-2">Visual Content</h4>
                          <img 
                            src={results.educationalImage.url} 
                            alt="Educational illustration"
                            className="w-full rounded-lg mb-2"
                          />
                        </div>
                      )}

                      {results.comprehensiveGuide && (
                        <div className="bg-slate-700/30 rounded-lg p-4">
                          <h4 className="text-purple-400 font-medium mb-2">Study Guide</h4>
                          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                            {results.comprehensiveGuide}
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

                      {results.supportingVisual && (
                        <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                          <h4 className="text-cyan-400 font-medium mb-2">Visual Support</h4>
                          <img 
                            src={results.supportingVisual.url} 
                            alt="Study session visual"
                            className="w-full rounded-lg"
                          />
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
    </div>
  );
}