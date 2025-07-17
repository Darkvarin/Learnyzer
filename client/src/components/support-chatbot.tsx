import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! I\'m your AI assistant for Learnyzer. I can help you with questions about our platform, features, exams, subscriptions, and any issues you might be facing. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial tooltip and periodic animation effect
  useEffect(() => {
    // Show tooltip on first load after 3 seconds
    const initialTimeout = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000);
      }
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []);

  // Tooltip animation effect - shows every 15 seconds when chat is closed
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 4000); // Hide after 4 seconds
      }, 15000); // Show every 15 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await apiRequest('POST', '/api/support/chat', {
        message: inputValue.trim(),
        conversationHistory: messages.slice(-10) // Send last 10 messages for context
      });

      const data = await response.json();
      setIsTyping(false);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.reply || 'I apologize, but I received an empty response. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment, or feel free to contact our support team directly at learnyzer.ai@gmail.com.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        {/* Animated Tooltip Bubble */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="absolute bottom-16 right-0 mb-2 w-48 bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-purple-400/30"
            >
              <div className="text-white text-sm font-medium">
                💬 Hi! How can I assist you today?
              </div>
              <div className="text-purple-200 text-xs mt-1">
                Ask me about Learnyzer features, exams, or any questions!
              </div>
              {/* Arrow pointing to chat button */}
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-gradient-to-r from-purple-600 to-blue-600 rotate-45 border-b border-r border-purple-400/30"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false); // Hide tooltip when opening chat
          }}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          
          {/* Pulse animation when tooltip is showing */}
          {showTooltip && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/40 to-blue-400/40"
            />
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        className={`fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] ${isMinimized ? 'h-auto' : 'h-[500px]'}`}
      >
        <Card className="h-full bg-gray-900/95 border-purple-500/30 shadow-2xl backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm text-white">Learnyzer Support</CardTitle>
                <p className="text-xs text-gray-400">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                        }`}>
                          {message.type === 'user' ? 
                            <User className="h-3 w-3 text-white" /> : 
                            <Bot className="h-3 w-3 text-white" />
                          }
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30'
                            : 'bg-gray-800/50 border border-gray-700/50'
                        }`}>
                          {message.type === 'bot' ? (
                            <div className="text-sm text-white prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown 
                                components={{
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-white" {...props} />,
                                  strong: ({node, ...props}) => <strong className="text-purple-300 font-semibold" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 text-white" {...props} />,
                                  li: ({node, ...props}) => <li className="mb-1 text-white" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-lg font-bold text-purple-300 mb-2" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-base font-bold text-purple-300 mb-2" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-sm font-bold text-purple-300 mb-1" {...props} />,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{formatTime(message.timestamp)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start space-x-2 max-w-[80%]">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="p-4 border-t border-gray-700/50">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by AI • For urgent issues: learnyzer.ai@gmail.com
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}