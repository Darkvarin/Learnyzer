import { useState } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Button,
  Input,
  Textarea,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress
} from "@/components/ui";
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
  Sparkles
} from "lucide-react";

export default function AnswerChecker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [subject, setSubject] = useState("mathematics");
  const [activeTab, setActiveTab] = useState("input");
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    correctAnswer: string;
    improvements: string[];
  } | null>(null);

  const checkAnswerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/tools/answer-check", {
        question,
        answer,
        subject
      });
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
    onError: () => {
      toast({
        title: "Failed to check answer",
        description: "There was an error evaluating your answer. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both the question and your answer.",
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
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
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
            <Card className="bg-dark-surface border-dark-border h-full">
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
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="text-blue-400 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-400 mb-1">How to use</h3>
                        <p className="text-xs text-gray-300">
                          Enter the question and your answer, then select the subject area. 
                          Our AI will evaluate your answer and provide detailed feedback and suggestions 
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
            <Card className="bg-dark-surface border-dark-border">
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
                          Subject
                        </label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger className="bg-dark-card border-dark-border">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-card border-dark-border">
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                            <SelectItem value="physics">Physics</SelectItem>
                            <SelectItem value="chemistry">Chemistry</SelectItem>
                            <SelectItem value="biology">Biology</SelectItem>
                            <SelectItem value="computer_science">Computer Science</SelectItem>
                            <SelectItem value="economics">Economics</SelectItem>
                            <SelectItem value="history">History</SelectItem>
                            <SelectItem value="literature">Literature</SelectItem>
                            <SelectItem value="language">Language</SelectItem>
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
                          className="bg-dark-card border-dark-border min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="answer" className="text-sm font-medium">
                          Your Answer
                        </label>
                        <Textarea
                          id="answer"
                          placeholder="Enter your answer here..."
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="bg-dark-card border-dark-border min-h-[150px]"
                          required
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-500 text-white"
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
                        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
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
                              <div className="bg-dark-surface p-3 rounded-lg text-gray-300">
                                {question}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2 flex items-center">
                                <ThumbsUp className={`h-4 w-4 mr-2 ${feedback.score >= 70 ? 'text-green-400' : 'text-gray-400'}`} />
                                Your Answer
                              </h4>
                              <div className="bg-dark-surface p-3 rounded-lg text-gray-300">
                                {answer}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2 flex items-center">
                                <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                                Correct Answer
                              </h4>
                              <div className="bg-green-900/20 border border-green-900/30 p-3 rounded-lg text-gray-300">
                                {feedback.correctAnswer}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2">Feedback</h4>
                              <div className="bg-dark-surface p-3 rounded-lg text-gray-300">
                                {feedback.feedback}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-md font-semibold mb-2">Areas for Improvement</h4>
                              <ul className="space-y-2">
                                {feedback.improvements.map((improvement, idx) => (
                                  <li key={idx} className="flex items-start gap-2 bg-dark-surface p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300">{improvement}</span>
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
                            className="bg-dark-card border-dark-border"
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