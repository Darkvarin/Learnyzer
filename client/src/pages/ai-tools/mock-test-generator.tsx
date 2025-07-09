import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Download, 
  Brain,
  Target,
  Timer,
  Trophy,
  Lock,
  Play,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { SubscriptionGuard } from "@/components/subscription/subscription-guard";

interface MockTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: string;
}

interface MockTest {
  id: number;
  title: string;
  examType: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  isCompleted: boolean;
  score?: number;
  createdAt: string;
  questions?: string; // JSON string of questions
  answerKey?: string; // JSON string of answer keys
}

// Mock Test Viewer Component
function MockTestViewer({ test, onBack }: { test: MockTest; onBack: () => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const { toast } = useToast();

  // Fetch detailed test data with questions
  const { data: detailedTest, isLoading } = useQuery<MockTest>({
    queryKey: [`/api/mock-test/${test.id}`],
    enabled: !!test.id,
  });

  // Use detailed test data if available, otherwise use the passed test
  const testData = detailedTest || test;

  // Parse questions from JSON string with error handling
  let questions: MockTestQuestion[] = [];
  let answerKey: string[] = [];
  
  try {
    if (testData.questions) {
      // The questions are stored as JSON strings in the database
      const parsedQuestions = typeof testData.questions === 'string' ? JSON.parse(testData.questions) : testData.questions;
      questions = Array.isArray(parsedQuestions) ? parsedQuestions : [];
    }
    if (testData.answerKey) {
      // The answerKey is stored as JSON strings in the database
      const parsedAnswerKey = typeof testData.answerKey === 'string' ? JSON.parse(testData.answerKey) : testData.answerKey;
      answerKey = Array.isArray(parsedAnswerKey) ? parsedAnswerKey : [];
    }
  } catch (error) {
    console.error('Error parsing test data:', error, 'Test object:', testData);
    toast({
      title: "Error Loading Test",
      description: "Unable to load test questions. Please try again.",
      variant: "destructive",
    });
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    toast({
      title: "Test Submitted!",
      description: "Your answers have been saved. You can now view the results.",
    });
    setShowAnswers(true);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">No questions available</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
        {/* Test Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tests
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAnswers(!showAnswers)}
              className="flex items-center gap-2"
            >
              {showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </Button>
          </div>
          
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
            <h1 className="text-xl font-bold mb-2">{testData.title}</h1>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {testData.duration} minutes
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {testData.totalQuestions} questions
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                {testData.totalMarks} marks
              </span>
            </div>
          </div>
        </div>

        {/* Question Display */}
        <Card className="bg-dark-surface border-dark-border mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {currentQuestion.marks} marks
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-100 leading-relaxed">
                {currentQuestion.question}
              </p>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = option.charAt(0); // A, B, C, D
                  const isSelected = userAnswers[currentQuestion.id.toString()] === optionLetter;
                  const isCorrect = showAnswers && answerKey[currentQuestionIndex] === optionLetter;
                  const isWrong = showAnswers && isSelected && !isCorrect;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id.toString(), optionLetter)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        isSelected 
                          ? isWrong 
                            ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                            : 'bg-primary/20 border-primary/30 text-primary'
                          : 'bg-dark-card border-dark-border hover:bg-dark-hover'
                      } ${isCorrect ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {showAnswers && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-medium text-blue-400 mb-2">Explanation:</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-400">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitTest}
              disabled={showAnswers}
              className="bg-green-600 hover:bg-green-700"
            >
              {showAnswers ? 'Test Completed' : 'Submit Test'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}

export default function MockTestGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    subject: "",
    difficulty: "",
    duration: "60",
    questionCount: "20",
    topics: ""
  });
  
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Get exam-specific subjects
  const getExamSubjects = () => {
    const subjectMap: Record<string, string[]> = {
      jee: ["Physics", "Chemistry", "Mathematics"],
      neet: ["Physics", "Chemistry", "Biology"],
      upsc: ["General Studies", "History", "Geography", "Polity", "Economics", "Environment", "Science & Technology", "Current Affairs"],
      clat: ["English", "General Knowledge", "Legal Reasoning", "Logical Reasoning", "Quantitative Techniques"],
      cuet: ["General Test", "Domain Subjects", "Language"],
      cse: ["Programming", "Data Structures", "Algorithms", "Computer Networks", "Operating Systems", "Database Systems", "Computer Architecture"],
      cgle: ["General Awareness", "Quantitative Aptitude", "English Language", "Reasoning"]
    };
    
    // If user has selected an exam, return exam-specific subjects (convert to lowercase for matching)
    const selectedExam = user?.selectedExam?.toLowerCase();
    if (selectedExam && subjectMap[selectedExam]) {
      return subjectMap[selectedExam];
    }
    
    // Fallback: return all subjects from all exams
    const allSubjects = Object.values(subjectMap).flat();
    return [...new Set(allSubjects)].sort(); // Remove duplicates and sort
  };

  // Fetch user's mock tests
  const { data: mockTests = [], refetch: refetchTests } = useQuery<MockTest[]>({
    queryKey: ['/api/mock-tests'],
  });

  // Generate mock test mutation
  const generateTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/mock-test/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          examType: user?.selectedExam,
          subject: formData.subject,
          difficulty: formData.difficulty,
          duration: parseInt(formData.duration),
          questionCount: parseInt(formData.questionCount),
          topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Mock test generation failed' }));
        throw new Error(errorData.message || 'Mock test generation failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Mock Test Generated!",
        description: "Your practice test is ready. You can start taking it now."
      });
      refetchTests();
      setSelectedTest(data.mockTest);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate mock test. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Download PDF mutation
  const downloadPDFMutation = useMutation({
    mutationFn: async (testId: number) => {
      const response = await fetch(`/api/mock-test/${testId}/download-pdf`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mock_test_${testId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "PDF Downloaded",
        description: "Mock test has been downloaded successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.selectedExam) {
      toast({
        title: "Exam Not Selected",
        description: "Please select your target exam in profile settings first.",
        variant: "destructive",
      });
      return;
    }
    generateTestMutation.mutate();
  };

  // If a test is selected, show the test viewer
  if (selectedTest) {
    return <MockTestViewer test={selectedTest} onBack={() => setSelectedTest(null)} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning/20 rounded-lg">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-gaming">Mock Test Generator</h1>
              <p className="text-gray-400">Generate AI-powered practice tests for your exam preparation</p>
            </div>
            {user?.selectedExam && (
              <Badge variant="outline" className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
                {user.selectedExam.toUpperCase()} Locked
              </Badge>
            )}
          </div>
        </div>

        <SubscriptionGuard featureType="mock_test_generation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Test Generation Form */}
            <div className="lg:col-span-2">
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Generate New Mock Test
                  </CardTitle>
                  <CardDescription>
                    Create a personalized practice test based on your exam requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">
                          Subject
                          {!user?.selectedExam && (
                            <span className="text-sm text-amber-400 ml-2">(All subjects available)</span>
                          )}
                          {user?.selectedExam && (
                            <span className="text-sm text-green-400 ml-2">({user.selectedExam.toUpperCase()} subjects only)</span>
                          )}
                        </Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                        >
                          <SelectTrigger id="subject">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {getExamSubjects().map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                        >
                          <SelectTrigger id="difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Select
                          value={formData.duration}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                        >
                          <SelectTrigger id="duration">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                            <SelectItem value="180">3 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="questionCount">Number of Questions</Label>
                        <Select
                          value={formData.questionCount}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, questionCount: value }))}
                        >
                          <SelectTrigger id="questionCount">
                            <SelectValue placeholder="Select question count" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 questions</SelectItem>
                            <SelectItem value="20">20 questions</SelectItem>
                            <SelectItem value="30">30 questions</SelectItem>
                            <SelectItem value="50">50 questions</SelectItem>
                            <SelectItem value="100">100 questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topics">Specific Topics (Optional)</Label>
                      <Textarea
                        id="topics"
                        placeholder="Enter specific topics separated by commas (e.g., Kinematics, Newton's Laws, Work Energy)"
                        value={formData.topics}
                        onChange={(e) => setFormData(prev => ({ ...prev, topics: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!formData.subject || !formData.difficulty || generateTestMutation.isPending}
                    >
                      {generateTestMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Generating Test...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Generate Mock Test
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Previous Tests */}
            <div>
              <Card className="bg-dark-surface border-dark-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    Your Mock Tests
                  </CardTitle>
                  <CardDescription>
                    View your generated practice tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mockTests.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No mock tests generated yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mockTests.slice(0, 5).map((test) => (
                        <div
                          key={test.id}
                          className="p-3 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-hover transition-colors cursor-pointer"
                          onClick={() => setSelectedTest(test)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm line-clamp-1">{test.title}</h4>
                            {test.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <Play className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Timer className="h-3 w-3" />
                            {test.duration} min
                            <Target className="h-3 w-3" />
                            {test.totalQuestions} questions
                          </div>
                          {test.isCompleted && test.score !== undefined && (
                            <div className="mt-2 text-xs">
                              <span className="text-green-400">Score: {test.score}/{test.totalMarks}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SubscriptionGuard>
      </main>

      <MobileNavigation />
    </div>
  );
}