import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuestionContent } from "@/components/practice/QuestionContent";

export default function Answer() {
  const [questionId, setQuestionId] = useState("");
  const [question, setQuestion] = useState<any>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!questionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question ID",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Question not found",
        variant: "destructive",
      });
      return;
    }

    setQuestion(data);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-6">
        <div className="flex gap-4 items-end">
          <div className="flex-grow space-y-2">
            <label htmlFor="questionId" className="text-sm font-medium">
              Question ID
            </label>
            <Input
              id="questionId"
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              placeholder="Enter question ID"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {question && (
          <div className="border rounded-lg p-6">
            <QuestionContent
              question={question}
              selectedAnswer={question.correct_answer}
              showFeedback={true}
              onAnswerSelect={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}