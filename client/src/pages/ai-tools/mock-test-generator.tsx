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
  Play
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
    if (!user?.selectedExam) return [];
    
    const subjectMap: Record<string, string[]> = {
      JEE: ["Physics", "Chemistry", "Mathematics"],
      NEET: ["Physics", "Chemistry", "Biology"],
      UPSC: ["General Studies", "History", "Geography", "Polity", "Economics", "Environment", "Science & Technology", "Current Affairs"],
      CLAT: ["English", "General Knowledge", "Legal Reasoning", "Logical Reasoning", "Quantitative Techniques"],
      CUET: ["General Test", "Domain Subjects", "Language"],
      CSE: ["Programming", "Data Structures", "Algorithms", "Computer Networks", "Operating Systems", "Database Systems", "Computer Architecture"],
      CGLE: ["General Awareness", "Quantitative Aptitude", "English Language", "Reasoning"]
    };
    
    return subjectMap[user.selectedExam] || [];
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
                {user.selectedExam} Locked
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
                        <Label htmlFor="subject">Subject</Label>
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