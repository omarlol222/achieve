
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuestionSearchProps {
  onQuestionFound: (questionText: string) => void;
}

export function QuestionSearch({ onQuestionFound }: QuestionSearchProps) {
  const { toast } = useToast();
  const [questionId, setQuestionId] = useState("");

  const handleQuestionSearch = async () => {
    if (!questionId.trim()) {
      toast({
        description: "Please enter a question ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const questionText = `Question: ${data.question_text}\n\nChoices:\n1. ${data.choice1}\n2. ${data.choice2}\n3. ${data.choice3}\n4. ${data.choice4}\n\nCorrect Answer: ${data.correct_answer}`;
        onQuestionFound(questionText);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find question. Please check the ID and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Find Question
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Find a Question</SheetTitle>
          <SheetDescription>
            Enter a question ID to find it.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question-id">Question ID</Label>
            <div className="flex gap-2">
              <Input
                id="question-id"
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
                placeholder="Enter question ID..."
              />
              <Button onClick={handleQuestionSearch}>Search</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
