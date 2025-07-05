import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookText, 
  FileDown, 
  Copy, 
  Sparkles, 
  ArrowLeft,
  Check,
  Loader2,
  Info,
  BrainCircuit,
  FileImage,
  Workflow,
  GitBranch,
  Network,
  Clock
} from "lucide-react";

export default function StudyNotesGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("concise");
  const [level, setLevel] = useState("high_school");
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("input");

  // Debug logging to track state changes
  useEffect(() => {
    console.log("Study Notes State:", { 
      activeTab, 
      hasNotes: !!generatedNotes,
      notesLength: generatedNotes?.length || 0 
    });
  }, [activeTab, generatedNotes]);
  const [selectedDiagrams, setSelectedDiagrams] = useState<string[]>([]);

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
    : [
        "Physics", "Chemistry", "Mathematics", "Biology", "History", 
        "Geography", "Political Science", "Economics", "English", "Current Affairs", "Computer Science"
      ];

  const generateNotesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/tools/notes", {
        topic,
        subject,
        style,
        level
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedNotes(data.notes);
      setActiveTab("result");
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      toast({
        title: "Study Notes Generated",
        description: "Your personalized study notes are ready!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate notes",
        description: "There was an error creating your study notes. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCopyToClipboard = () => {
    if (generatedNotes) {
      navigator.clipboard.writeText(generatedNotes);
      toast({
        title: "Copied to clipboard",
        description: "Your study notes have been copied to the clipboard."
      });
    }
  };

  const downloadPDFMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/tools/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: `Study Notes: ${topic}`,
          content: generatedNotes,
          subject: subject || undefined,
          examType: undefined // You can add exam type selection if needed
        }),
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_notes.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF Downloaded",
        description: "Your study notes have been saved as a PDF file."
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  });

  const downloadDiagramPDFMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/tools/generate-diagram-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          topic,
          contentType: style === "visual" ? "diagram-heavy" : "mixed",
          diagramTypes: selectedDiagrams,
          examType: undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Visual PDF generation failed');
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_visual_guide.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Visual PDF Downloaded",
        description: "Your diagram-rich study guide has been saved!"
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "There was an error generating the visual PDF. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDownloadPDF = () => {
    if (generatedNotes && topic) {
      if (style === "visual" && selectedDiagrams.length > 0) {
        downloadDiagramPDFMutation.mutate();
      } else {
        downloadPDFMutation.mutate();
      }
    }
  };

  const handleDiagramToggle = (diagramType: string) => {
    setSelectedDiagrams(prev => 
      prev.includes(diagramType) 
        ? prev.filter(d => d !== diagramType)
        : [...prev, diagramType]
    );
  };

  const diagramTypes = [
    { value: "flowchart", label: "Flowchart", icon: Workflow },
    { value: "mindmap", label: "Mind Map", icon: BrainCircuit },
    { value: "concept-map", label: "Concept Map", icon: Network },
    { value: "process-diagram", label: "Process Diagram", icon: GitBranch },
    { value: "timeline", label: "Timeline", icon: Clock }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !subject.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both a topic and subject.",
        variant: "destructive",
      });
      return;
    }
    generateNotesMutation.mutate();
  };

  const handleReset = () => {
    setGeneratedNotes(null);
    setActiveTab("input");
    setTopic("");
    setSubject("");
    setStyle("concise");
    setLevel("high_school");
    setSelectedDiagrams([]);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden futuristic-bg">
      {/* Modern cyberpunk grid background with subtle Solo Leveling accents */}
      <div className="absolute inset-0 cyber-grid z-0 opacity-20"></div>
      
      {/* Animated glowing orbs */}
      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-purple-500/10 filter blur-[80px] animate-pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-blue-500/10 filter blur-[100px] animate-pulse-glow z-0" style={{animationDelay: '1s'}}></div>
      
      {/* Minimal energy flow line - subtle Solo Leveling accent */}
      <div className="absolute h-full w-full overflow-hidden z-0">
        <div className="energy-flow-horizontal top-2/3 opacity-30"></div>
      </div>
      
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-20 md:pb-6 relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/ai-tools">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-gaming">Study Notes Generator</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Tool info */}
          <div className="md:col-span-1">
            <Card className="glassmorphism border-cyan-500/30 h-full relative">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-cyan-500/30 opacity-70"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-cyan-500/30 opacity-70"></div>
              
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                  <BookText className="text-cyan-400 h-6 w-6 relative z-10" />
                </div>
                <CardTitle className="text-white">Study Notes Generator</CardTitle>
                <CardDescription className="text-cyan-200/70">
                  Create personalized notes from any study material
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Features</h3>
                    <ul className="space-y-2">
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Custom formatting options</span>
                      </li>
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Export to PDF or Word</span>
                      </li>
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Include diagrams and visual aids</span>
                      </li>
                      <li className="text-sm text-gray-400 flex items-start">
                        <Check className="text-green-400 w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Simplified explanations for complex topics</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="text-blue-400 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-400 mb-1">How to use</h3>
                        <p className="text-xs text-gray-300">
                          Enter your study topic, select the subject area and the style of notes you want. 
                          Our AI will generate comprehensive study notes tailored to your preferences.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Generator */}
          <div className="md:col-span-2">
            <Card className="glassmorphism border-primary/30 relative">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-primary/30 opacity-70"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-primary/30 opacity-70"></div>
              
              <CardHeader>
                <CardTitle className="text-white">Generate Your Study Notes</CardTitle>
                <CardDescription className="text-primary-200/70">
                  Customize and create study materials tailored to your learning style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="input">Input</TabsTrigger>
                    <TabsTrigger value="result" disabled={!generatedNotes}>Results</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="input" className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="topic" className="text-sm font-medium">
                            Topic
                          </label>
                          <Input
                            id="topic"
                            placeholder="e.g. Photosynthesis, French Revolution"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-background/60 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="subject" className="text-sm font-medium">
                            Subject {examLocked && userExam && (
                              <span className="text-green-400 text-xs ml-2">
                                ({userExam.toUpperCase()} subjects only)
                              </span>
                            )}
                          </label>
                          <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger className="bg-background/60 border-cyan-500/30 focus:border-cyan-400">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(subj => (
                                <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label htmlFor="style" className="text-sm font-medium">
                            Note Style
                          </label>
                          <Select value={style} onValueChange={setStyle}>
                            <SelectTrigger className="bg-background/60 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20">
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 border-cyan-500/30">
                              <SelectItem value="concise">Concise & Direct</SelectItem>
                              <SelectItem value="detailed">Detailed & Thorough</SelectItem>
                              <SelectItem value="visual">Visual & Diagram-heavy</SelectItem>
                              <SelectItem value="question">Question & Answer Format</SelectItem>
                              <SelectItem value="simplified">Simplified Language</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="level" className="text-sm font-medium">
                            Education Level
                          </label>
                          <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger className="bg-background/60 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20">
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 border-cyan-500/30">
                              <SelectItem value="elementary">Elementary School</SelectItem>
                              <SelectItem value="middle_school">Middle School</SelectItem>
                              <SelectItem value="high_school">High School</SelectItem>
                              <SelectItem value="undergraduate">Undergraduate</SelectItem>
                              <SelectItem value="graduate">Graduate Level</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Diagram Types Selection - Only show when visual style is selected */}
                      {style === "visual" && (
                        <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                          <label className="text-sm font-medium">Select Diagram Types for Visual PDF</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {diagramTypes.map((diagram) => {
                              const Icon = diagram.icon;
                              const isSelected = selectedDiagrams.includes(diagram.value);
                              
                              return (
                                <div
                                  key={diagram.value}
                                  onClick={() => handleDiagramToggle(diagram.value)}
                                  className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                                      : 'border-gray-600 hover:border-cyan-500/50 text-gray-400 hover:text-white'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span className="text-xs font-medium">{diagram.label}</span>
                                </div>
                              );
                            })}
                          </div>
                          {selectedDiagrams.length === 0 && (
                            <p className="text-xs text-orange-400">
                              Select at least one diagram type for visual PDF generation
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full bg-cyan-500/80 hover:bg-cyan-500 text-white transform transition-all duration-300 hover:translate-y-[-2px] relative overflow-hidden border border-cyan-400/20"
                          disabled={generateNotesMutation.isPending}
                        >
                          {generateNotesMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Study Notes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="result" className="space-y-4">
                    {generatedNotes ? (
                      <>
                        <div className="bg-background/60 border border-cyan-500/30 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto whitespace-pre-line text-white/90 relative">
                          {/* Corner decorations */}
                          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60"></div>
                          {generatedNotes}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={handleReset}
                            className="bg-background/60 border-cyan-500/30 hover:bg-cyan-500/10 text-white/90 transition-colors"
                          >
                            Create New Notes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCopyToClipboard}
                            className="bg-background/60 border-cyan-500/30 hover:bg-cyan-500/10 text-white/90 transition-colors"
                          >
                            <Copy className="mr-2 h-4 w-4 text-cyan-400" />
                            Copy to Clipboard
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleDownloadPDF}
                            disabled={
                              downloadPDFMutation.isPending || 
                              downloadDiagramPDFMutation.isPending ||
                              (style === "visual" && selectedDiagrams.length === 0)
                            }
                            className="bg-background/60 border-cyan-500/30 hover:bg-cyan-500/10 text-white/90 transition-colors"
                          >
                            {(downloadPDFMutation.isPending || downloadDiagramPDFMutation.isPending) ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {style === "visual" ? "Creating Visual PDF..." : "Generating PDF..."}
                              </>
                            ) : (
                              <>
                                <FileDown className="mr-2 h-4 w-4 text-cyan-400" />
                                {style === "visual" ? "Download Visual PDF" : "Download as PDF"}
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <BrainCircuit className="h-16 w-16 mb-4 opacity-20" />
                        <p>No study notes generated yet</p>
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