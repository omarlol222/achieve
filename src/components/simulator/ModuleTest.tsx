import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

  const handleSubmit = async () => {
    try {
      console.log("Submitting module progress:", moduleProgress.id);
      
      // First update the module progress completion
      const { error: progressError } = await supabase
        .from("module_progress")
        .update({ 
          completed_at: new Date().toISOString(),
        })
        .eq("id", moduleProgress.id);

      if (progressError) {
        console.error("Error updating module progress:", progressError);
        throw progressError;
      }

      // Get the session ID from module progress
      const { data: moduleProgressData, error: sessionError } = await supabase
        .from("module_progress")
        .select("session_id")
        .eq("id", moduleProgress.id)
        .single();

      if (sessionError) {
        console.error("Error getting session ID:", sessionError);
        throw sessionError;
      }

      // Update the test session to trigger score calculation
      const { error: sessionUpdateError } = await supabase
        .from("test_sessions")
        .update({ 
          completed_at: new Date().toISOString()
        })
        .eq("id", moduleProgressData.session_id);

      if (sessionUpdateError) {
        console.error("Error updating test session:", sessionUpdateError);
        throw sessionUpdateError;
      }

      console.log("Module submitted successfully");
      
      // Call the onComplete callback to move to next module or complete test
      onComplete();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast({
        variant: "destructive",
        title: "Error submitting module",
        description: error.message,
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      console.log("Checking existing module questions");
      
      // First, check if questions already exist for this module
      const { data: existingQuestions, error: existingError } = await supabase
        .from("module_questions")
        .select("question_id")
        .eq("module_id", moduleProgress.module.id);

      if (existingError) throw existingError;

      if (existingQuestions && existingQuestions.length > 0) {
        console.log("Found existing questions, fetching details");
        const questionIds = existingQuestions.map(q => q.question_id);
        
        const { data: questions, error: questionsError } = await supabase
          .from("questions")
          .select(`
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
          `)
          .in('id', questionIds);

        if (questionsError) throw questionsError;
        
        setQuestions(questions || []);
        setIsLoading(false);
        return;
      }

      console.log("No existing questions found, selecting new ones");
      
      // Fetch module topics to get percentages and question counts
      const { data: moduleTopics, error: topicsError } = await supabase
        .from("module_topics")
        .select("topic_id, percentage, question_count")
        .eq("module_id", moduleProgress.module.id);

      if (topicsError) throw topicsError;

      if (!moduleTopics || moduleTopics.length === 0) {
        console.log("No topics found for module");
        toast({
          variant: "destructive",
          title: "No topics found",
          description: "This module has no topics assigned.",
        });
        return;
      }

      // Fetch and select questions for each topic
      const selectedQuestions = [];
      const questionRecords = [];

      for (const topic of moduleTopics) {
        const { data: topicQuestions, error: questionsError } = await supabase
          .from("questions")
          .select(`
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
          `)
          .eq("topic_id", topic.topic_id);

        if (questionsError) throw questionsError;

        if (topicQuestions && topicQuestions.length > 0) {
          const shuffled = topicQuestions.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, topic.question_count);
          selectedQuestions.push(...selected);
          
          // Prepare records for module_questions table
          selected.forEach(q => {
            questionRecords.push({
              module_id: moduleProgress.module.id,
              question_id: q.id
            });
          });
        }
      }

      if (selectedQuestions.length === 0) {
        console.log("No questions found for any topic");
        toast({
          variant: "destructive",
          title: "No questions found",
          description: "No questions available for the selected topics.",
        });
        return;
      }

      // Record selected questions in module_questions table
      const { error: recordError } = await supabase
        .from("module_questions")
        .insert(questionRecords);

      if (recordError) throw recordError;

      // Shuffle final question set
      const shuffledQuestions = selectedQuestions.sort(() => 0.5 - Math.random());
      setQuestions(shuffledQuestions);
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
        showFeedback={false}
        moduleName={moduleProgress.module.name}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        flagged={flagged}
        onQuestionSelect={setCurrentIndex}
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