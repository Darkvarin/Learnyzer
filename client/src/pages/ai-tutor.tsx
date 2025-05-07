import { useState } from 'react';
import { Header } from "@/components/layout/header";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Button,
  Input,
  Skeleton 
} from "@/components/ui";
import { 
  Send, 
  Mic, 
  Paperclip, 
  Settings2, 
  MessageSquare,
  Robot,
  HelpCircle,
  Book,
  GraduationCap,
  FileCheck,
  UserCircle
} from "lucide-react";

export default function AiTutor() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  
  const { data: aiTutor, isLoading: isLoadingTutor } = useQuery({
    queryKey: ['/api/ai/tutor'],
    enabled: !!user,
  });
  
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['/api/ai/conversation/recent'],
    enabled: !!user,
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/ai/tutor/respond", { message });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversation/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
    },
    onError: () => {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
  };
  
  const handleVoiceInteraction = () => {
    toast({
      title: "Voice interaction activated",
      description: "Speak clearly and I'll listen to your questions."
    });
    // Voice interaction logic would be implemented here
  };

  const handlePromptClick = (promptText: string) => {
    setMessage(promptText);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      <Header />
      <MobileNavigation />
      
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold font-gaming mb-6">AI Tutor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar with AI tutor info */}
          <div className="md:col-span-1">
            <div className="bg-dark-surface rounded-xl border border-dark-border p-6 h-full">
              {isLoadingTutor ? (
                <div className="space-y-4 flex flex-col items-center">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-24 w-full mt-4" />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <img 
                      src={aiTutor?.image || "/ai-tutor-placeholder.svg"} 
                      alt={aiTutor?.name || "AI Tutor"} 
                      className="w-full h-full rounded-full border-4 border-primary-600 p-1 bg-dark-card object-cover"
                    />
                    <div className="absolute -bottom-2 right-0 bg-green-500 rounded-full p-1 border-2 border-dark-surface">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold mt-4 font-gaming">{aiTutor?.name || "AI Tutor"}</h2>
                  <p className="text-sm text-gray-400 mt-1 text-center mb-6">{aiTutor?.specialty || "Your Personal Learning Assistant"}</p>
                  
                  <div className="w-full bg-dark-card rounded-lg p-4 text-sm">
                    <h3 className="font-semibold mb-2">About Me</h3>
                    <p className="text-gray-400 text-sm">
                      {aiTutor?.description || "I'm your AI learning companion, here to help you master any subject through personalized guidance and support."}
                    </p>
                    
                    <h3 className="font-semibold mt-4 mb-2">Specialties</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-300">
                        <GraduationCap className="h-4 w-4 text-primary-400" />
                        <span>{aiTutor?.subjects?.[0] || "Personalized explanations"}</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <Book className="h-4 w-4 text-primary-400" />
                        <span>{aiTutor?.subjects?.[1] || "Study material creation"}</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <FileCheck className="h-4 w-4 text-primary-400" />
                        <span>{aiTutor?.subjects?.[2] || "Progress tracking"}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-center gap-3 mt-6">
                    <Button 
                      size="icon" 
                      onClick={handleVoiceInteraction}
                      className="bg-primary-600 hover:bg-primary-500 text-white"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="bg-dark-card hover:bg-dark-hover text-white">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="bg-dark-card hover:bg-dark-hover text-white">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main chat area */}
          <div className="md:col-span-3 flex flex-col">
            <div className="bg-dark-surface rounded-xl border border-dark-border p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-gaming">Chat Session</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-dark-card hover:bg-dark-hover">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                  <Button variant="outline" size="sm" className="bg-dark-card hover:bg-dark-hover">
                    New Chat
                  </Button>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="bg-dark-card rounded-lg p-4 flex-1 min-h-[400px] overflow-y-auto mb-4">
                {isLoadingConversation ? (
                  <>
                    <div className="flex items-start space-x-3 mb-4">
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="w-full">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="w-full">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                      </div>
                    </div>
                  </>
                ) : conversation && conversation.messages && conversation.messages.length > 0 ? (
                  conversation.messages.map((msg, idx) => (
                    <div key={idx} className="flex items-start space-x-3 mb-6">
                      {msg.role === 'assistant' ? (
                        <>
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Robot className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-primary-400 mb-1">{aiTutor?.name || "AI Tutor"}</div>
                            <div className="bg-dark-surface text-gray-200 p-4 rounded-lg border border-dark-border">
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-dark-surface rounded-full flex items-center justify-center flex-shrink-0 border border-dark-border">
                            <UserCircle className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold mb-1">You</div>
                            <div className="bg-primary-900/20 text-gray-200 p-4 rounded-lg">
                              {msg.content}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Robot className="h-16 w-16 mb-4 text-gray-600" />
                    <p className="text-lg mb-2">Start a conversation with your AI tutor</p>
                    <p className="text-sm text-center max-w-md">
                      Ask questions about any subject, request study materials, or get help with difficult concepts.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  type="text"
                  placeholder="Ask anything about your studies..."
                  className="w-full bg-dark-card border border-dark-border focus:border-primary-500 rounded-lg py-3 px-4 text-gray-300 focus:outline-none pr-20 h-12"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button type="button" size="icon" variant="ghost" className="text-gray-400 hover:text-white transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost"
                    onClick={handleVoiceInteraction}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white transition-colors"
                    disabled={sendMessageMutation.isPending || !message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              
              {/* Quick prompts */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                  onClick={() => handlePromptClick("Create a study plan for my upcoming exams")}
                >
                  <span className="block font-semibold">Create a study plan</span>
                </Button>
                <Button
                  variant="outline"
                  className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                  onClick={() => handlePromptClick("Explain the concept of quantum mechanics simply")}
                >
                  <span className="block font-semibold">Explain quantum mechanics</span>
                </Button>
                <Button
                  variant="outline"
                  className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                  onClick={() => handlePromptClick("Create practice questions for calculus")}
                >
                  <span className="block font-semibold">Generate practice questions</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}