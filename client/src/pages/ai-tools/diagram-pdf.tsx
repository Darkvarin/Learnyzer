import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Loader2, 
  FileImage, 
  Workflow, 
  GitBranch, 
  Network,
  Timeline,
  BrainCircuit,
  Sparkles
} from "lucide-react";

export default function DiagramPDF() {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [examType, setExamType] = useState("");
  const [contentType, setContentType] = useState("mixed");
  const [selectedDiagrams, setSelectedDiagrams] = useState<string[]>([]);

  const diagramTypes = [
    { value: "flowchart", label: "Flowchart", icon: Workflow, description: "Step-by-step process visualization" },
    { value: "mindmap", label: "Mind Map", icon: BrainCircuit, description: "Central concept with branching ideas" },
    { value: "concept-map", label: "Concept Map", icon: Network, description: "Connected concepts with relationships" },
    { value: "process-diagram", label: "Process Diagram", icon: GitBranch, description: "Detailed process flow with decisions" },
    { value: "timeline", label: "Timeline", icon: Timeline, description: "Chronological sequence of events" }
  ];

  const contentTypes = [
    { value: "text", label: "Text-Heavy", description: "Primarily text with diagrams at the end" },
    { value: "mixed", label: "Mixed Content", description: "Balanced text and diagrams throughout" },
    { value: "diagram-heavy", label: "Diagram-Heavy", description: "Visual-focused with minimal text" }
  ];

  const examTypes = [
    { value: "JEE", label: "JEE (Engineering)" },
    { value: "NEET", label: "NEET (Medical)" },
    { value: "UPSC", label: "UPSC (Civil Services)" },
    { value: "CLAT", label: "CLAT (Law)" },
    { value: "CUET", label: "CUET (University)" },
    { value: "CSE", label: "CSE (Computer Science)" },
    { value: "CGLE", label: "CGLE (Government)" }
  ];

  const generateDiagramPDFMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/tools/generate-diagram-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          topic,
          contentType,
          diagramTypes: selectedDiagrams,
          examType: examType || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Visual PDF generation failed');
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_visual_guide.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Visual PDF Generated",
        description: "Your diagram-rich study guide has been downloaded successfully!"
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "There was an error creating your visual PDF. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDiagramToggle = (diagramType: string) => {
    setSelectedDiagrams(prev => 
      prev.includes(diagramType) 
        ? prev.filter(d => d !== diagramType)
        : [...prev, diagramType]
    );
  };

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your visual study guide.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDiagrams.length === 0) {
      toast({
        title: "Diagrams Required",
        description: "Please select at least one diagram type.",
        variant: "destructive",
      });
      return;
    }

    generateDiagramPDFMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Visual Study Guide Generator
            </h1>
            <p className="text-gray-300 text-lg">
              Create diagram-rich PDF study materials with AI-generated flowcharts, mind maps, and visual content
            </p>
          </div>

          <Tabs defaultValue="input" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/60">
              <TabsTrigger value="input" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Configure
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Preview & Generate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6">
              {/* Topic Input */}
              <Card className="bg-slate-800/60 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <FileImage className="h-5 w-5" />
                    Study Topic
                  </CardTitle>
                  <CardDescription>
                    Enter the main topic you want to create visual study materials for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="topic" className="text-gray-300 mb-2 block">Topic</Label>
                      <Input
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Photosynthesis in Plants, Calculus Integration, Atomic Structure"
                        className="bg-slate-700/60 border-cyan-500/30 text-white placeholder-gray-400"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="examType" className="text-gray-300 mb-2 block">Entrance Exam (Optional)</Label>
                      <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger className="bg-slate-700/60 border-cyan-500/30 text-white">
                          <SelectValue placeholder="Choose your entrance exam" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-cyan-500/30">
                          {examTypes.map((exam) => (
                            <SelectItem key={exam.value} value={exam.value} className="text-white">
                              {exam.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Type Selection */}
              <Card className="bg-slate-800/60 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Content Layout</CardTitle>
                  <CardDescription>
                    Choose how you want text and diagrams to be arranged in your PDF
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contentTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => setContentType(type.value)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          contentType === type.value
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-gray-600 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="font-semibold text-white mb-2">{type.label}</div>
                        <div className="text-sm text-gray-400">{type.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Diagram Type Selection */}
              <Card className="bg-slate-800/60 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Visual Diagrams</CardTitle>
                  <CardDescription>
                    Select the types of diagrams to include in your study guide
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diagramTypes.map((diagram) => {
                      const Icon = diagram.icon;
                      const isSelected = selectedDiagrams.includes(diagram.value);
                      
                      return (
                        <div
                          key={diagram.value}
                          onClick={() => handleDiagramToggle(diagram.value)}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-500/10'
                              : 'border-gray-600 hover:border-cyan-500/50'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleDiagramToggle(diagram.value)}
                            className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                          />
                          <Icon className={`h-6 w-6 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className={`font-semibold ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                              {diagram.label}
                            </div>
                            <div className="text-sm text-gray-400">{diagram.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card className="bg-slate-800/60 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-400">Generation Preview</CardTitle>
                  <CardDescription>
                    Review your selections and generate your visual study guide
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Topic</h3>
                      <p className="text-gray-300">{topic || "No topic specified"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">Entrance Exam</h3>
                      <p className="text-gray-300">{examType ? examTypes.find(e => e.value === examType)?.label : "General content"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">Content Layout</h3>
                      <p className="text-gray-300">{contentTypes.find(c => c.value === contentType)?.label}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-2">Diagram Types</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDiagrams.length > 0 ? (
                          selectedDiagrams.map(diagramType => (
                            <Badge key={diagramType} variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                              {diagramTypes.find(d => d.value === diagramType)?.label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400">No diagrams selected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-600">
                    <Button
                      onClick={handleGenerate}
                      disabled={generateDiagramPDFMutation.isPending || !topic.trim() || selectedDiagrams.length === 0}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3"
                    >
                      {generateDiagramPDFMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Visual PDF...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" />
                          Generate Visual Study Guide
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {generateDiagramPDFMutation.isPending && (
                <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-4">
                      <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
                      <div className="text-center">
                        <h3 className="font-semibold text-white mb-1">Creating Your Visual Study Guide</h3>
                        <p className="text-gray-300 text-sm">
                          Generating educational content and creating {selectedDiagrams.length} diagram{selectedDiagrams.length !== 1 ? 's' : ''}...
                        </p>
                      </div>
                      <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}