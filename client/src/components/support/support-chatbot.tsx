import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hi there! 👋 I'm your Learnyzer support assistant. How can I help you today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send message to API
      const response = await apiRequest("POST", "/api/support/chat", { message: input });
      const data = await response.json();
      
      // Add AI response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting support response:", error);
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
      {/* Chat button */}
      {!isOpen && (
        <Button 
          onClick={toggleChat} 
          className="rounded-full w-14 h-14 p-0 animated-gradient-border"
        >
          <span className="absolute inset-[1.5px] bg-background rounded-full flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </span>
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div 
          className={`neumorph-card transition-all duration-300 w-80 md:w-96 ${
            isMinimized ? 'h-16' : 'h-[450px]'
          }`}
        >
          {/* Chat header */}
          <div className="glassmorphism p-3 flex items-center justify-between border-b border-primary/20">
            <div className="flex items-center">
              <div className="relative mr-2">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-pulse blur-sm"></div>
                <div className="relative z-10 w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Support Assistant</h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary/10"
                onClick={toggleMinimize}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4 text-gray-400" />
                ) : (
                  <Minimize2 className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary/10"
                onClick={toggleChat}
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>

          {/* Chat content (hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Messages container */}
              <div className="bg-background/50 p-4 h-[330px] overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary/20 text-white"
                          : "glassmorphism border border-primary/10 text-gray-200"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="glassmorphism border border-primary/10 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-3 border-t border-primary/10 glassmorphism flex items-center">
                <textarea
                  className="flex-1 bg-background/50 border border-primary/20 rounded-lg resize-none p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ask a question..."
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="ml-2 bg-primary/20 hover:bg-primary/30 text-primary"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}