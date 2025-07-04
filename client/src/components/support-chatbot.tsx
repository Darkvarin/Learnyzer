import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { searchFAQs, type FAQ } from "@shared/faq-data";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  faqs?: FAQ[];
}

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '👋 Hi! I\'m your Learnyzer support assistant. I can help you with questions about our platform, subscriptions, AI features, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaqExpansion = (faqId: string) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFaqs(newExpanded);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userQuery: string): string => {
    const query = userQuery.toLowerCase();
    
    // Check for greetings
    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return "Hello! I'm here to help you with any questions about Learnyzer. You can ask me about our features, subscriptions, AI tutoring, or anything else!";
    }
    
    // Smart contextual responses based on query analysis
    const lowerQuery = query.toLowerCase();

    // Intelligent contact queries
    if (lowerQuery.includes('contact') || (lowerQuery.includes('support') && (lowerQuery.includes('email') || lowerQuery.includes('phone') || lowerQuery.includes('number')))) {
      if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || lowerQuery.includes('immediate')) {
        return "For urgent issues, call us directly at +91 9910601733 - we respond fast! For non-urgent questions, email learnyzer.ai@gmail.com or continue chatting with me here. What's the specific issue you're facing?";
      } else if (lowerQuery.includes('billing') || lowerQuery.includes('payment') || lowerQuery.includes('refund')) {
        return "For billing or payment issues, email learnyzer.ai@gmail.com with your account details, or call +91 9910601733. We handle refunds quickly and offer 7-day money-back guarantee. What payment issue can I help with?";
      } else {
        return "You can reach our support team at:\n📧 learnyzer.ai@gmail.com (detailed questions)\n📞 +91 9910601733 (quick calls)\n\nI'm also here to help! What specific question do you have about Learnyzer?";
      }
    }
    
    // Smart pricing queries with context
    if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('subscription') || lowerQuery.includes('plan') || lowerQuery.includes('fee')) {
      if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable') || lowerQuery.includes('budget')) {
        return "Budget-friendly options:\n• FREE Trial: 1 day with full features\n• Basic: ₹799/month (most affordable paid plan)\n• Yearly: ₹12999 (best savings vs monthly)\n\nThe free trial lets you test everything before spending money. Which exam are you preparing for?";
      } else if (lowerQuery.includes('best') || lowerQuery.includes('recommend')) {
        return "Most popular choice:\n• Pro Plan: ₹1500/month (2 AI tutor sessions + all tools daily)\n• Yearly Plan: ₹12999 (3 AI tutor sessions + maximum savings)\n\nPro is perfect for serious exam prep, Yearly for long-term students. Start with free trial to test first!";
      } else if (lowerQuery.includes('difference') || lowerQuery.includes('compare')) {
        return "Plan comparison:\n• Basic (₹799): All AI tools, no AI tutor\n• Pro (₹1500): + 2 AI tutor sessions daily\n• Yearly (₹12999): + 3 AI tutor sessions, big savings\n\nMain difference is AI tutor access. Which feature matters most to you?";
      } else {
        return "Smart pricing for students:\n• FREE Trial: 1 day (2 AI sessions + 10 tools)\n• Basic: ₹799/month (unlimited AI tools)\n• Pro: ₹1500/month (+ 2 AI tutor sessions daily)\n• Yearly: ₹12999 (+ 3 AI tutor sessions, best value!)\n\nAll include gamification and progress tracking. Which exam are you targeting?";
      }
    }
    
    // Smart AI/tutoring queries
    if (lowerQuery.includes('ai') || lowerQuery.includes('tutor') || lowerQuery.includes('chatbot') || lowerQuery.includes('gpt')) {
      if (lowerQuery.includes('voice') || lowerQuery.includes('speak') || lowerQuery.includes('talk')) {
        return "Yes! Our AI tutor has full voice interaction - you can literally talk to it and it talks back. It's powered by GPT-4o, so conversations feel natural. Perfect for hands-free learning while doing problems or taking notes. Try it in the free trial!";
      } else if (lowerQuery.includes('smart') || lowerQuery.includes('intelligent') || lowerQuery.includes('good')) {
        return "Our AI tutor is quite intelligent - it's built on GPT-4o (the latest model). It personalizes content to your specific exam (JEE, NEET, etc.), adapts to your learning style, creates visual diagrams with DALL-E 3, and tracks your weak areas. Much smarter than basic chatbots!";
      } else if (lowerQuery.includes('help') || lowerQuery.includes('teach') || lowerQuery.includes('learn')) {
        return "The AI tutor acts like your personal teacher - explains concepts step-by-step, creates visual diagrams for complex topics, answers doubts in real-time, gives practice problems, and adapts to your exam. It's like having a 24/7 expert tutor who knows your syllabus inside out.";
      } else {
        return "Our AI tutor uses cutting-edge GPT-4o technology - it's like having a super smart teacher available 24/7. It creates visual learning content with DALL-E 3, has voice interaction, and personalizes everything to your specific entrance exam. Way more advanced than basic chatbots!";
      }
    }
    
    // Check for exam-related queries
    if (query.includes('exam') || query.includes('entrance') || query.includes('jee') || query.includes('neet') || query.includes('upsc') || query.includes('clat') || query.includes('cuet') || query.includes('cse') || query.includes('cgle')) {
      return "Learnyzer supports 7 major competitive exams: JEE, NEET, UPSC, CLAT, CUET, CSE, and CGLE. Each exam has specialized content, dedicated courses, and AI tutors designed specifically for that preparation track.";
    }

    // Check for mobile/app queries
    if (query.includes('mobile') || query.includes('app') || query.includes('phone') || query.includes('android') || query.includes('ios')) {
      return "Learnyzer works perfectly on mobile devices through your web browser. Our platform is fully responsive and optimized for mobile learning. You can access all features including AI tutoring and study tools on your smartphone or tablet.";
    }

    // Check for free trial queries
    if (query.includes('free') || query.includes('trial') || query.includes('demo')) {
      return "Yes! We offer a free 1-day trial that gives you access to 2 AI tutor sessions and 10 AI tool uses. This lets you experience our GPT-4o powered tutoring and visual learning features before subscribing. No credit card required!";
    }

    // Check for platform overview queries
    if ((query.includes('what') && query.includes('learnyzer')) || query.includes('about') || query.includes('platform')) {
      return "Learnyzer is an AI-powered educational platform for Indian students preparing for competitive entrance exams. We use GPT-4o for personalized tutoring, DALL-E 3 for visual learning, and gamification to make studying engaging.";
    }

    // Check for features queries
    if (query.includes('feature') || query.includes('what can') || query.includes('functionality')) {
      return "Learnyzer offers:\n• AI Tutoring with GPT-4o technology\n• Voice interaction for hands-free learning\n• Visual learning with DALL-E 3 image generation\n• Gamified learning with levels, ranks, and achievements\n• Progress tracking and analytics\n• Competitive battles with other students\n• Personalized study plans\n• Multi-exam support (JEE, NEET, UPSC, CLAT, CUET, CSE, CGLE)";
    }

    // Check for how it works queries
    if (query.includes('how') && (query.includes('work') || query.includes('use') || query.includes('start'))) {
      return "Getting started is easy:\n1. Sign up for your free 1-day trial\n2. Choose your target entrance exam\n3. Complete your profile setup\n4. Start learning with our AI tutor\n5. Track your progress and earn achievements\n\nOur AI adapts to your learning style and provides personalized content for your chosen exam.";
    }

    // Check for technical requirements
    if (query.includes('requirement') || query.includes('system') || query.includes('browser') || query.includes('internet')) {
      return "Technical requirements are minimal:\n• Any modern web browser (Chrome, Firefox, Safari, Edge)\n• Stable internet connection\n• Works on desktop, laptop, tablet, and mobile\n• No downloads or installations required\n• Supports voice features on compatible devices\n\nOur platform is web-based and works on any device with internet access.";
    }

    // Check for payment/billing queries
    if (query.includes('payment') || query.includes('billing') || query.includes('refund') || query.includes('money back')) {
      return "Payment information:\n• We accept all major credit/debit cards\n• Secure payment processing through Razorpay\n• 7-day money-back guarantee on all plans\n• Automatic billing for subscriptions\n• Cancel anytime with immediate effect\n• Indian pricing optimized for students\n\nYour payment data is completely secure and encrypted.";
    }
    
    // Default response for unmatched queries - more helpful
    return "I can help you with questions about Learnyzer's features, pricing, exams, technical requirements, or how to get started. What specific information would you like to know about our AI-powered learning platform?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Try to use the enhanced API endpoint first
      console.log("Sending chat request with query:", currentQuery);
      console.log("Request payload:", { query: currentQuery });
      const response = await apiRequest("POST", "/api/support/chat", { query: currentQuery });
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: (response as any).aiResponse || generateBotResponse(currentQuery),
        timestamp: new Date(),
        faqs: (response as any).faqs?.length > 0 ? (response as any).faqs : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("API error, falling back to local response:", error);
      
      // Fallback to local FAQ search and response generation
      const relevantFAQs = searchFAQs(currentQuery);
      console.log("Generating local response for query:", currentQuery);
      const botResponse = generateBotResponse(currentQuery);
      console.log("Generated local response:", botResponse);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        faqs: relevantFAQs.length > 0 ? relevantFAQs : undefined
      };

      setMessages(prev => [...prev, botMessage]);
    }
    
    setIsTyping(false);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    handleSendMessage();
  };

  const quickQuestions = [
    "What is Learnyzer?",
    "How much does it cost?",
    "What exams do you support?",
    "How does the AI tutor work?",
    "What's included in free trial?"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Learnyzer Support</h3>
            <p className="text-xs text-green-400">● Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'bot' && (
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                    : 'bg-slate-800 text-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>

                {message.type === 'user' && (
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* FAQ Suggestions */}
              {message.faqs && message.faqs.length > 0 && (
                <div className="ml-8 space-y-2">
                  <p className="text-xs text-gray-400 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Related help articles:
                  </p>
                  {message.faqs.slice(0, 3).map((faq) => {
                    const isExpanded = expandedFaqs.has(faq.id);
                    return (
                      <Card 
                        key={faq.id} 
                        className="bg-slate-800/50 border-slate-600 cursor-pointer hover:bg-slate-700/50 transition-colors"
                        onClick={() => toggleFaqExpansion(faq.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-white">{faq.question}</h4>
                                {isExpanded ? 
                                  <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" /> : 
                                  <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                }
                              </div>
                              <p className={`text-xs text-gray-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {faq.answer}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-gray-400 mb-2 flex items-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            Quick questions:
          </p>
          <div className="space-y-1">
            {quickQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="w-full text-left text-xs p-2 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Contact Info */}
        <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-400">
          <a href="mailto:learnyzer.ai@gmail.com" className="flex items-center hover:text-cyan-400">
            <Mail className="h-3 w-3 mr-1" />
            Email Support
          </a>
          <a href="tel:+919910601733" className="flex items-center hover:text-cyan-400">
            <Phone className="h-3 w-3 mr-1" />
            Call Support
          </a>
        </div>
      </div>
    </div>
  );
}