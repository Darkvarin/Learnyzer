import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export function AiTutorSection() {
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
      return apiRequest("POST", "/api/ai/conversation", { message });
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

  return (
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-gaming">AI Tutor</h2>
          <Button size="sm" className="text-xs bg-primary-600 hover:bg-primary-700 text-white">
            Full Session
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            {isLoadingTutor ? (
              <Skeleton className="w-40 h-40 rounded-full" />
            ) : (
              <div className="relative w-40 h-40 mx-auto">
                <img 
                  src={aiTutor?.image || "/ai-tutor-placeholder.svg"} 
                  alt={aiTutor?.name || "AI Tutor"} 
                  className="rounded-full border-4 border-primary-600 p-1 bg-dark-card"
                />
                <div className="absolute -bottom-2 right-0 bg-success-500 rounded-full p-1 border-2 border-dark-surface">
                  <i className="ri-checkbox-circle-fill text-lg"></i>
                </div>
              </div>
            )}
            
            {isLoadingTutor ? (
              <Skeleton className="h-7 w-24 mt-4" />
            ) : (
              <h3 className="text-lg font-bold mt-4 font-gaming">{aiTutor?.name || "Akira"}</h3>
            )}
            
            {isLoadingTutor ? (
              <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              <p className="text-xs text-gray-400 mt-1 text-center">{aiTutor?.specialty || "Your AI Tutor"}</p>
            )}
            
            <div className="flex items-center mt-4 space-x-4">
              <Button 
                size="icon" 
                onClick={handleVoiceInteraction}
                className="bg-primary-600 hover:bg-primary-500 text-white"
              >
                <i className="ri-mic-fill"></i>
              </Button>
              <Button size="icon" variant="outline" className="bg-dark-card hover:bg-dark-hover text-white">
                <i className="ri-chat-3-line"></i>
              </Button>
              <Button size="icon" variant="outline" className="bg-dark-card hover:bg-dark-hover text-white">
                <i className="ri-settings-4-line"></i>
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 flex flex-col">
            <div className="bg-dark-card rounded-lg p-4 flex-1 min-h-[200px] max-h-[300px] overflow-y-auto">
              {isLoadingConversation ? (
                <>
                  <div className="flex items-start space-x-3 mb-4">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                  </div>
                </>
              ) : conversation && conversation.messages ? (
                conversation.messages.map((msg, idx) => (
                  <div key={idx} className="flex items-start space-x-3 mb-4">
                    {msg.role === 'assistant' ? (
                      <>
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="ri-robot-line"></i>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-primary-400">{aiTutor?.name || "AI Tutor"}</div>
                          <p className="text-gray-300">{msg.content}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-dark-surface rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : "YOU"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">You</div>
                          <div className="bg-dark-surface text-gray-300 p-3 rounded-lg">
                            {msg.content}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Start a conversation with your AI tutor</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="mt-4 relative">
              <Input
                type="text"
                placeholder="Ask anything about your studies..."
                className="w-full bg-dark-card border border-dark-border focus:border-primary-500 rounded-lg py-3 px-4 text-gray-300 focus:outline-none pr-20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button type="button" size="icon" variant="ghost" className="text-gray-400 hover:text-white transition-colors">
                  <i className="ri-attachment-2"></i>
                </Button>
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="ghost" 
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={sendMessageMutation.isPending || !message.trim()}
                >
                  <i className="ri-send-plane-fill"></i>
                </Button>
              </div>
            </form>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                onClick={() => setMessage("Create a calculus cheat sheet")}
              >
                <span className="block font-semibold">Create calculus cheat sheet</span>
              </Button>
              <Button
                variant="outline"
                className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto"
                onClick={() => setMessage("Explain integration by parts")}
              >
                <span className="block font-semibold">Explain integration by parts</span>
              </Button>
              <Button
                variant="outline"
                className="bg-dark-card hover:bg-dark-hover border border-dark-border text-xs py-2 px-3 rounded-lg transition-colors text-left h-auto hidden md:block"
                onClick={() => setMessage("Give me practice problems for calculus")}
              >
                <span className="block font-semibold">Practice problems</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
