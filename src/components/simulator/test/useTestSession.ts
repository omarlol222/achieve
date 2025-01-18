import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useTestSession(initialModuleIndex = 0) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(initialModuleIndex);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (!timeLeft) {
      handleModuleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: session, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(session.id);

      await loadModuleQuestions();
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadModuleQuestions = async () => {
    try {
      const subjectName = currentModuleIndex === 0 ? "Verbal" : "Quantitative";
      
      const { data: questions, error } = await supabase
        .from("questions")
        .select(`
          *,
          topic:topics!topic_id (
            id,
            name,
            subject:subjects (
              id,
              name
            )
          )
        `)
        .eq("topic.subject.name", subjectName)
        .limit(20);

      if (error) throw error;
      setQuestions(questions || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnswer = async (answer: number) => {
    if (!sessionId) return;

    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      const { error } = await supabase
        .from("module_answers")
        .insert({
          module_progress_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: answer,
          is_flagged: flagged[currentQuestionIndex] || false
        });

      if (error) throw error;

      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: answer
      }));

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: err.message
      });
    }
  };

  const handleModuleComplete = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("session_id", sessionId)
        .eq("module_id", currentModuleIndex.toString());

      if (error) throw error;

      if (currentModuleIndex === 0) {
        setCurrentModuleIndex(1);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setFlagged({});
        setTimeLeft(3600);
        await loadModuleQuestions();
      } else {
        const { error: sessionError } = await supabase
          .from("test_sessions")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        if (sessionError) throw sessionError;

        navigate(`/gat/simulator/results/${sessionId}`);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error completing module",
        description: err.message
      });
    }
  };

  const toggleFlag = () => {
    setFlagged(prev => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex]
    }));
  };

  return {
    sessionId,
    currentModuleIndex,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    flagged,
    timeLeft,
    loading,
    error,
    handleAnswer,
    handleModuleComplete,
    toggleFlag
  };
}