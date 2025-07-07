import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Brain, Lightbulb } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

      toast({
        title: result.isCorrect ? "Correct!" : "Incorrect",
        description: result.isCorrect ? "Great job! Keep it up." : "Don't worry, learning from mistakes is part of the process.",
        variant: result.isCorrect ? "default" : "destructive",
      });
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
        ? 'bg-primary-600/20 border-primary-500 text-white' 
        : 'bg-dark-surface border-dark-border text-gray-200 hover:bg-dark-hover';
    }

    if (option === correctAnswer) {
      return 'bg-green-600/20 border-green-500 text-green-200';
    }
    
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'bg-red-600/20 border-red-500 text-red-200';
    }
    
    return 'bg-dark-surface border-dark-border text-gray-400';
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
        <div className="text-gray-200 font-medium leading-relaxed">
          {question}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {Object.entries(options).map(([key, value]) => (
            <div
              key={key}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${getOptionColor(key)}`}
              onClick={() => handleAnswerSelect(key)}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">
                  {key}.
                </span>
                <span className="text-sm">
                  {value}
                </span>
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
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feedback}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Original Explanation */}
        {isSubmitted && explanation && (
          <div className="mt-3 p-3 bg-primary-900/10 border border-primary-800/30 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Original Explanation:</p>
            <p className="text-gray-300 text-sm">
              {explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}