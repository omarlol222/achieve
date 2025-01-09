import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Flag, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ModuleTestProps = {
  moduleProgress: {
    id: string;
    module: {
      id: string;
      name: string;
      time_limit: number;
    };
  };
  onComplete: () => void;
};

export function ModuleTest({ moduleProgress, onComplete }: ModuleTestProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(moduleProgress.module.time_limit * 60);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("module_questions")
        .select(`
          question_id,
          questions (
            id,
            question_text,
            choice1,
            choice2,
            choice3,
            choice4,
            correct_answer,
            question_type,
            comparison_value1,
            comparison_value2,
            image_url,
            explanation,
            passage_text
          )
        `)
        .eq("module_id", moduleProgress.module.id);

      if (error) throw error;

      const formattedQuestions = data.map((item) => ({
        ...item.questions,
      }));

      setQuestions(formattedQuestions);
      setIsLoading(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading questions",
        description: error.message,
      });
    }
  };

  const handleAnswer = async (answer: number) => {
    const currentQuestion = questions[currentIndex];
    
    try {
      const { error } = await supabase
        .from("module_answers")
        .insert({
          module_progress_id: moduleProgress.id,
          question_id: currentQuestion.id,
          selected_answer: answer,
          is_flagged: flagged[currentQuestion.id] || false,
        });

      if (error) throw error;

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: error.message,
      });
    }
  };

  const toggleFlag = () => {
    const currentQuestion = questions[currentIndex];
    setFlagged((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Update module progress as completed
      const { error: progressError } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", moduleProgress.id);

      if (progressError) throw progressError;

      onComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error submitting module",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">{moduleProgress.module.name}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Timer className="h-4 w-4" />
            <span>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex justify-end mb-4">
          <Button
            variant={flagged[currentQuestion.id] ? "default" : "outline"}
            size="sm"
            onClick={toggleFlag}
            className="flex items-center gap-2"
          >
            <Flag className="h-4 w-4" />
            {flagged[currentQuestion.id] ? "Flagged" : "Flag for review"}
          </Button>
        </div>

        <QuestionContent
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id] || null}
          showFeedback={false}
          onAnswerSelect={handleAnswer}
        />
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
          >
            Submit Module
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!hasAnswered}
            className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}