import { useState, useEffect } from "react";
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
  EyeOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle
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
  const [timeRemaining, setTimeRemaining] = useState(0); // Initialize to 0, will be set when test data loads
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const { toast } = useToast();

  // Fetch detailed test data with questions
  const { data: detailedTest, isLoading } = useQuery<MockTest>({
    queryKey: [`/api/mock-test/${test.id}`],
    enabled: !!test.id,
  });

  // Use detailed test data if available, otherwise use the passed test
  const testData = detailedTest || test;

  // Initialize timer when test data is available
  useEffect(() => {
    if (testData?.duration && timeRemaining === 0) {
      setTimeRemaining(testData.duration * 60); // Convert minutes to seconds
    }
  }, [testData?.duration, timeRemaining]);

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

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false);
          toast({
            title: "Time's Up!",
            description: "The test has been automatically submitted.",
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining, toast]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  // Calculate score
  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    
    questions.forEach((question, index) => {
      maxScore += question.marks;
      const userAnswer = userAnswers[question.id.toString()];
      const correctAnswer = answerKey[index];
      
      if (userAnswer === correctAnswer) {
        totalScore += question.marks;
      }
    });
    
    return { totalScore, maxScore };
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Auto-advance to next question if enabled and not showing answers
    if (autoAdvance && !showAnswers) {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }, 800); // Small delay to show selection before advancing
    }
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
      
      <main className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
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
            
            <div className="flex items-center gap-3">
              {/* Score Display */}
              {showAnswers && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-900/20 border border-purple-800">
                  <Trophy className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">
                    Score: {calculateScore().totalScore}/{calculateScore().maxScore}
                  </span>
                  <span className="text-xs text-purple-300">
                    ({Math.round((calculateScore().totalScore / calculateScore().maxScore) * 100)}%)
                  </span>
                </div>
              )}
              
              {/* Timer Display */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono border-2 ${
                timeRemaining < 300 ? 'bg-red-900/30 text-red-300 border-red-600' : 
                timeRemaining < 900 ? 'bg-yellow-900/30 text-yellow-300 border-yellow-600' : 
                'bg-green-900/30 text-green-300 border-green-600'
              }`}>
                <Timer className="h-5 w-5" />
                <span className="text-lg font-bold tracking-wider">
                  {timeRemaining > 0 ? formatTime(timeRemaining) : '00:00'}
                </span>
                {timeRemaining < 300 && timeRemaining > 0 && (
                  <span className="text-sm ml-1 animate-pulse font-bold">⚠️</span>
                )}
              </div>
              
              {/* Auto-advance Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`flex items-center gap-1 text-xs ${
                  autoAdvance ? 'text-green-400' : 'text-gray-400'
                }`}
              >
                {autoAdvance ? '⚡ Auto' : '⏸️ Manual'}
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
          </div>
          
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold">{testData.title}</h1>
              
              {/* Timer Display in Header */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono border-2 ${
                timeRemaining < 300 ? 'bg-red-900/30 text-red-300 border-red-600' : 
                timeRemaining < 900 ? 'bg-yellow-900/30 text-yellow-300 border-yellow-600' : 
                'bg-green-900/30 text-green-300 border-green-600'
              }`}>
                <Timer className="h-5 w-5" />
                <div className="text-center">
                  <p className="text-xs text-gray-400">Time Left</p>
                  <p className="text-lg font-bold tracking-wider">
                    {timeRemaining > 0 ? formatTime(timeRemaining) : '00:00'}
                  </p>
                </div>
                {timeRemaining < 300 && timeRemaining > 0 && (
                  <span className="text-sm ml-1 animate-pulse font-bold">⚠️</span>
                )}
              </div>
            </div>
            
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

        {/* Question Progress Indicator */}
        <div className="flex flex-wrap gap-2 mb-4">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                index === currentQuestionIndex
                  ? 'bg-primary text-primary-foreground'
                  : userAnswers[questions[index].id.toString()]
                  ? showAnswers
                    ? userAnswers[questions[index].id.toString()] === answerKey[index]
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {index + 1}
            </button>
          ))}
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
                      disabled={showAnswers}
                      className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center justify-between ${
                        isSelected 
                          ? isWrong 
                            ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                            : 'bg-primary/20 border-primary/30 text-primary'
                          : 'bg-dark-card border-dark-border hover:bg-dark-hover'
                      } ${isCorrect ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''} ${
                        showAnswers ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <span>{option}</span>
                      {showAnswers && (
                        <div className="flex items-center">
                          {isCorrect && (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          )}
                          {isWrong && (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          {isSelected && !isWrong && !isCorrect && (
                            <AlertCircle className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {showAnswers && (
                <div className="mt-6 space-y-4">
                  {/* Answer Status */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    userAnswers[currentQuestion.id.toString()] === answerKey[currentQuestionIndex]
                      ? 'bg-green-500/10 border border-green-500/20'
                      : userAnswers[currentQuestion.id.toString()]
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'bg-yellow-500/10 border border-yellow-500/20'
                  }`}>
                    {userAnswers[currentQuestion.id.toString()] === answerKey[currentQuestionIndex] ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="font-medium text-green-400">Correct!</span>
                        <span className="text-green-300">+{currentQuestion.marks} marks</span>
                      </>
                    ) : userAnswers[currentQuestion.id.toString()] ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-400" />
                        <span className="font-medium text-red-400">Incorrect</span>
                        <span className="text-red-300">
                          Your answer: {userAnswers[currentQuestion.id.toString()]} | 
                          Correct: {answerKey[currentQuestionIndex]}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <span className="font-medium text-yellow-400">Not Attempted</span>
                        <span className="text-yellow-300">
                          Correct answer: {answerKey[currentQuestionIndex]}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Detailed Explanation */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Detailed Explanation
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-300 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                      
                      {/* Additional Learning Tips */}
                      <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <h5 className="text-sm font-medium text-purple-400 mb-1">💡 Study Tip:</h5>
                        <p className="text-sm text-purple-300">
                          {currentQuestion.difficulty === 'easy' ? 
                            'Focus on understanding the basic concept. This is fundamental knowledge you should master.' :
                            currentQuestion.difficulty === 'medium' ?
                            'This requires application of concepts. Practice similar problems to strengthen your understanding.' :
                            'This is an advanced question. Break it down step by step and relate it to fundamental principles.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Summary - only show when answers are visible */}
        {showAnswers && (
          <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20 mb-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h3 className="text-2xl font-bold text-purple-400">
                      {calculateScore().totalScore}/{calculateScore().maxScore}
                    </h3>
                    <p className="text-sm text-gray-400">Total Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-400">
                      {Math.round((calculateScore().totalScore / calculateScore().maxScore) * 100)}%
                    </p>
                    <p className="text-sm text-gray-400">Percentage</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(calculateScore().totalScore / calculateScore().maxScore) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-green-400">
                      {questions.filter((q, i) => userAnswers[q.id.toString()] === answerKey[i]).length}
                    </p>
                    <p className="text-gray-400">Correct</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-red-400">
                      {questions.filter((q, i) => userAnswers[q.id.toString()] && userAnswers[q.id.toString()] !== answerKey[i]).length}
                    </p>
                    <p className="text-gray-400">Incorrect</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-yellow-400">
                      {questions.filter((q) => !userAnswers[q.id.toString()]).length}
                    </p>
                    <p className="text-gray-400">Unanswered</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
            {autoAdvance && !showAnswers && (
              <span className="text-xs text-green-400 animate-pulse">⚡ Auto-advance ON</span>
            )}
          </div>
          
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
      
      <main className="container mx-auto px-4 pt-24 pb-20 max-w-6xl">
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