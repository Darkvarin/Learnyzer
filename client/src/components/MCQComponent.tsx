import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Brain, Lightbulb } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MCQProps {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  topic: string;
  subject: string;
  onComplete?: (isCorrect: boolean) => void;
}

// Helper function to process LaTeX text and ensure proper math rendering
const processLatexText = (text: string): string => {
  // Convert raw LaTeX expressions to proper math blocks
  return text
    // Convert single dollar signs to double dollar signs for block math
    .replace(/\\\(([^)]+)\\\)/g, '$$$$1$$')
    // Ensure fractions are properly formatted
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$$\\frac{$1}{$2}$$')
    // Wrap standalone LaTeX expressions in math blocks
    .replace(/(\\\w+(?:\{[^}]*\})*(?:\s*\\\w+(?:\{[^}]*\})*)*)/g, (match) => {
      if (!match.startsWith('$$') && !match.endsWith('$$')) {
        return '$$' + match + '$$';
      }
      return match;
    });
};

export function MCQComponent({ 
  question, 
  options, 
  correctAnswer, 
  explanation, 
  topic, 
  subject,
  onComplete 
}: MCQProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnswerSelect = (option: string) => {
    if (!isSubmitted) {
      setSelectedAnswer(option);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      toast({
        title: "Select an Answer",
        description: "Please choose an option before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ai/mcq/evaluate', {
        question,
        selectedAnswer,
        correctAnswer,
        options,
        topic,
        subject
      });

      const result = await response.json();
      setFeedback(result.feedback);
      setIsSubmitted(true);
      
      if (onComplete) {
        onComplete(result.isCorrect);
      }

      // Show rewards notification for correct answers
      if (result.isCorrect && result.rewards) {
        toast({
          title: "Correct Answer! Rewards Earned! 🎓",
          description: `+${result.rewards.xpEarned} XP | +${result.rewards.rpEarned} RP for mastering the concept`,
        });
        
        // Refresh user stats when rewards are earned
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/rank'] });
      } else {
        toast({
          title: result.isCorrect ? "Correct!" : "Incorrect",
          description: result.isCorrect ? "Great job! Keep it up." : "Don't worry, learning from mistakes is part of the process.",
          variant: result.isCorrect ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('Error evaluating MCQ:', error);
      toast({
        title: "Error",
        description: "Failed to evaluate your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOptionColor = (option: string) => {
    if (!isSubmitted) {
      return selectedAnswer === option 
        ? 'bg-primary-600/20 border-primary-400 text-white' 
        : 'bg-gray-800/50 border-gray-600 text-gray-100 hover:bg-gray-700/60 hover:border-gray-500';
    }

    if (option === correctAnswer) {
      return 'bg-green-600/20 border-green-400 text-green-100';
    }
    
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'bg-red-600/20 border-red-400 text-red-100';
    }
    
    return 'bg-gray-800/30 border-gray-600 text-gray-300';
  };

  const getOptionIcon = (option: string) => {
    if (!isSubmitted) return null;
    
    if (option === correctAnswer) {
      return <Check className="h-4 w-4 text-green-400" />;
    }
    
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return <X className="h-4 w-4 text-red-400" />;
    }
    
    return null;
  };

  return (
    <Card className="bg-dark-card border-dark-border mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Brain className="h-5 w-5 text-primary-400" />
          Quick Assessment
          <Badge variant="secondary" className="ml-auto bg-primary-600/20 text-primary-300">
            {topic}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Question */}
        <div className="text-white font-semibold text-lg leading-relaxed p-3 bg-gray-800/40 rounded-lg border border-gray-600/50">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({children}) => <span className="text-white font-semibold">{children}</span>,
              code: ({children}) => <code className="bg-gray-700 px-1 py-0.5 rounded text-green-300">{children}</code>
            }}
          >
            {processLatexText(question)}
          </ReactMarkdown>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {Object.entries(options).map(([key, value]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex items-start justify-between hover:shadow-lg ${getOptionColor(key)}`}
              onClick={() => handleAnswerSelect(key)}
            >
              <div className="flex items-start gap-3 w-full">
                <span className="font-bold text-base min-w-[1.5rem] text-center mt-0.5">
                  {key}.
                </span>
                <div className="text-base leading-relaxed font-medium flex-1">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({children}) => <span>{children}</span>,
                      code: ({children}) => <code className="bg-gray-700 px-1 py-0.5 rounded text-green-300">{children}</code>
                    }}
                  >
                    {processLatexText(value)}
                  </ReactMarkdown>
                </div>
              </div>
              {getOptionIcon(key)}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <Button 
            onClick={handleSubmit}
            disabled={!selectedAnswer || isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white"
          >
            {isLoading ? 'Evaluating...' : 'Submit Answer'}
          </Button>
        )}

        {/* Feedback */}
        {isSubmitted && feedback && (
          <div className="mt-4 p-4 bg-dark-surface border border-dark-border rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-2">Teacher's Feedback</h4>
                <div className="text-gray-300 text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({children}) => <span className="text-gray-300">{children}</span>,
                      code: ({children}) => <code className="bg-gray-700 px-1 py-0.5 rounded text-green-300">{children}</code>
                    }}
                  >
                    {processLatexText(feedback)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Original Explanation */}
        {isSubmitted && explanation && (
          <div className="mt-3 p-3 bg-primary-900/10 border border-primary-800/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Original Explanation:</p>
            <div className="text-gray-300 text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({children}) => <span className="text-gray-300">{children}</span>,
                  code: ({children}) => <code className="bg-gray-700 px-1 py-0.5 rounded text-green-300">{children}</code>
                }}
              >
                {processLatexText(explanation)}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}