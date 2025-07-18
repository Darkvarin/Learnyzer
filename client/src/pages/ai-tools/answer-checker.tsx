import { useState } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  FileCheck, 
  ArrowLeft,
  Check,
  Loader2,
  Info,
  ThumbsUp,
  ThumbsDown,
  Copy,
  AlertCircle,
  Sparkles,
  Upload,
  Camera,
  X
} from "lucide-react";

export default function AnswerChecker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [subject, setSubject] = useState("");
  const [activeTab, setActiveTab] = useState("input");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "image">("text");

  // Get user data for exam selection check
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Check if user has selected an exam
  const userExam = (userData as any)?.selectedExam;
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
    : ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "Political Science", "Economics", "English", "Current Affairs", "Computer Science"];
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    correctAnswer: string;
    improvements: string[];
  } | null>(null);

  // Handle image upload and OCR
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkAnswerMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        question,
        subject,
        inputMode
      };
      
      if (inputMode === "text") {
        payload.answer = answer;
      } else {
        payload.imageData = uploadedImage;
      }
      
      const response = await apiRequest("POST", "/api/ai/tools/answer-check", payload);
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data);
      setActiveTab("result");
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      toast({
        title: "Answer Checked",
        description: "Your answer has been evaluated!",
      });
    },
    onError: (error: any) => {
      // Make exam-related error messages more concise
      let errorMessage = "There was an error evaluating your answer. Please try again.";
      if (error?.message?.includes("Access denied") && error?.message?.includes("exam preparation")) {
        errorMessage = "Content blocked - not available for your exam type";
      }
      
      toast({
        title: "Failed to check answer",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "Missing Question",
        description: "Please provide the question to evaluate.",
        variant: "destructive",
      });
      return;
    }
    
    if (inputMode === "text" && !answer.trim()) {
      toast({
        title: "Missing Answer",
        description: "Please provide your written answer.",
        variant: "destructive",
      });
      return;
    }
    
    if (inputMode === "image" && !uploadedImage) {
      toast({
        title: "Missing Image",
        description: "Please upload an image of your answer.",
        variant: "destructive",
      });
      return;
    }
    
    checkAnswerMutation.mutate();
  };

  const handleReset = () => {
    setFeedback(null);
    setActiveTab("input");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-20 md:pb-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/ai-tools">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-gaming">Answer Checker</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Tool info */}
          <div className="md:col-span-1">
            <Card className="bg-background/60 border border-cyan-500/30 h-full relative overflow-hidden backdrop-blur-sm">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60"></div>
              <CardHeader>
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="text-green-400 h-6 w-6" />
                </div>
                <CardTitle>Answer Checker</CardTitle>
                <CardDescription>
                  Get feedback on your answers to practice questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Features</h3>
                    <ul className="space-y-2">
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Detailed explanations of mistakes</span>
                      </li>
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Alternative solution methods</span>
                      </li>
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Scoring based on accuracy and approach</span>
                      </li>
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Improvement suggestions</span>
                      </li>
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>OCR support for handwritten answers</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="text-blue-400 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-400 mb-1">How to use</h3>
                        <p className="text-xs text-gray-300">
                          Enter the question and your answer (typed or upload an image), then select the subject area. 
                          Our AI uses OCR to read handwritten answers and provides detailed feedback with suggestions 
                          for improvement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Answer Checker */}
          <div className="md:col-span-2">
            <Card className="bg-background/60 border border-cyan-500/30 relative overflow-hidden backdrop-blur-sm">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60"></div>
              <CardHeader>
                <CardTitle>Check Your Answer</CardTitle>
                <CardDescription>
                  Get detailed feedback and improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="input">Input</TabsTrigger>
                    <TabsTrigger value="result" disabled={!feedback}>Results</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="input" className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">
                          Subject {examLocked && userExam && (
                            <span className="text-green-400 text-xs ml-2">
                              ({userExam.toUpperCase()} subjects only)
                            </span>
                          )}
                        </label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger className="bg-background/60 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 border-cyan-500/30">
                            {subjects.map(subj => (
                              <SelectItem key={subj} value={subj.toLowerCase().replace(/\s+/g, '_')}>{subj}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="question" className="text-sm font-medium">
                          Question
                        </label>
                        <Textarea
                          id="question"
                          placeholder="Enter the question you're answering..."
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          className="bg-background/60 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Your Answer</label>
                        
                        {/* Input Mode Selector */}
                        <div className="flex space-x-2 p-1 bg-background/40 rounded-lg border border-cyan-500/20">
                          <Button
                            type="button"
                            variant={inputMode === "text" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setInputMode("text")}
                            className={inputMode === "text" ? "bg-cyan-500/80 text-white" : "text-gray-400 hover:text-gray-200"}
                          >
                            <FileCheck className="w-4 h-4 mr-2" />
                            Type Answer
                          </Button>
                          <Button
                            type="button"
                            variant={inputMode === "image" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setInputMode("image")}
                            className={inputMode === "image" ? "bg-cyan-500/80 text-white" : "text-gray-400 hover:text-gray-200"}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>

                        {/* Text Input Mode */}
                        {inputMode === "text" && (
                          <Textarea
                            id="answer"
                            placeholder="Enter your answer here..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="bg-background/60 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 min-h-[150px]"
                            required
                          />
                        )}

                        {/* Image Upload Mode */}
                        {inputMode === "image" && (
                          <div className="space-y-3">
                            {!uploadedImage ? (
                              <div className="border-2 border-dashed border-cyan-500/30 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                  <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                                  <p className="text-sm text-gray-400 mb-2">
                                    Click to upload an image of your handwritten answer
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Supports JPG, PNG, WebP (max 5MB)
                                  </p>
                                </label>
                              </div>
                            ) : (
                              <div className="relative border border-cyan-500/30 rounded-lg p-4 bg-background/40">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setUploadedImage(null)}
                                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <img 
                                  src={uploadedImage} 
                                  alt="Uploaded answer" 
                                  className="max-w-full h-auto rounded border border-cyan-500/20"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                  ✓ Image uploaded successfully. Our AI will extract and evaluate your written answer.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full bg-cyan-500/80 hover:bg-cyan-500 text-white transform transition-all duration-300 hover:translate-y-[-2px] relative overflow-hidden border border-cyan-400/20"
                          disabled={checkAnswerMutation.isPending}
                        >
                          {checkAnswerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Checking Answer...
                            </>
                          ) : (
                            <>
                              <FileCheck className="mr-2 h-4 w-4" />
                              Check Answer
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="result" className="space-y-4">
                    {feedback ? (
                      <>
                        <div className="bg-background/60 border border-cyan-500/30 rounded-lg p-6 relative">
                          {/* Corner decorations */}
                          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60"></div>
                          <div className="flex flex-col items-center mb-6">
                            <h3 className="text-xl font-bold mb-2">Your Score</h3>
                            <div className={`text-4xl font-bold ${getScoreColor(feedback.score)}`}>
                              {feedback.score}%
                            </div>
                            <div className="w-full mt-2">
                              <Progress value={feedback.score} className={`h-2 ${getProgressColor(feedback.score)}`} />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-md font-semibold mb-2 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-2 text-blue-400" />
                                Question
                              </h4>
                              <div className="bg-background/40 border border-cyan-500/20 p-3 rounded-lg text-white/80">
                                {question}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2 flex items-center">
                                <ThumbsUp className={`h-4 w-4 mr-2 ${feedback.score >= 70 ? 'text-green-400' : 'text-gray-400'}`} />
                                Your Answer
                              </h4>
                              <div className="bg-background/40 border border-cyan-500/20 p-3 rounded-lg text-white/80">
                                {answer}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2 flex items-center">
                                <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                                Correct Answer
                              </h4>
                              <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg text-white/80">
                                {feedback.correctAnswer}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2">Feedback</h4>
                              <div className="bg-background/40 border border-cyan-500/20 p-3 rounded-lg text-white/80">
                                {feedback.feedback}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2">Areas for Improvement</h4>
                              <ul className="space-y-2">
                                {feedback.improvements.map((improvement, idx) => (
                                  <li key={idx} className="flex items-start gap-2 bg-background/40 border border-yellow-500/20 p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">{improvement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={handleReset}
                            className="bg-background/60 border-cyan-500/30 hover:bg-cyan-500/10 text-white/90 transition-colors"
                          >
                            Check Another Answer
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <FileCheck className="h-16 w-16 mb-4 opacity-20" />
                        <p>No answer checked yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}