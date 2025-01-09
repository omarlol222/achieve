import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModuleReview } from "./ModuleReview";
import { TestHeader } from "./test/TestHeader";
import { QuestionCard } from "./test/QuestionCard";
import { QuestionNavigation } from "./test/QuestionNavigation";

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
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    console.log("ModuleTest mounted, fetching questions");
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      console.log("Time's up, submitting module");
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
      console.log("Fetching questions for module:", moduleProgress.module.id);
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

      if (error) {
        console.error("Error fetching questions:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No questions found for module");
        toast({
          variant: "destructive",
          title: "No questions found",
          description: "This module has no questions assigned.",
        });
        return;
      }

      console.log("Questions fetched successfully:", data.length);
      const formattedQuestions = data.map((item) => ({
        ...item.questions,
      }));

      setQuestions(formattedQuestions);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error in fetchQuestions:", error);
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
      console.log("Saving answer:", {
        moduleProgressId: moduleProgress.id,
        questionId: currentQuestion.id,
        answer,
        isFlagged: flagged[currentQuestion.id],
      });

      const { error } = await supabase
        .from("module_answers")
        .insert({
          module_progress_id: moduleProgress.id,
          question_id: currentQuestion.id,
          selected_answer: answer,
          is_flagged: flagged[currentQuestion.id] || false,
        });

      if (error) {
        console.error("Error saving answer:", error);
        throw error;
      }

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));

      console.log("Answer saved successfully");
    } catch (error: any) {
      console.error("Error in handleAnswer:", error);
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

  const handleSubmit = async () => {
    try {
      console.log("Submitting module progress:", moduleProgress.id);
      const { error: progressError } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", moduleProgress.id);

      if (progressError) {
        console.error("Error updating module progress:", progressError);
        throw progressError;
      }

      console.log("Module submitted successfully");
      setShowReview(true);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
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

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>No questions available for this module.</p>
      </div>
    );
  }

  if (showReview) {
    return (
      <ModuleReview
        moduleProgressId={moduleProgress.id}
        onContinue={onComplete}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="space-y-6">
      <TestHeader
        moduleName={moduleProgress.module.name}
        timeLeft={timeLeft}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
      />

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id] || null}
        isFlagged={flagged[currentQuestion.id] || false}
        onAnswerSelect={handleAnswer}
        onToggleFlag={toggleFlag}
      />

      <QuestionNavigation
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        hasAnswered={hasAnswered}
        onPrevious={() => setCurrentIndex((prev) => prev - 1)}
        onNext={() => setCurrentIndex((prev) => prev + 1)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}