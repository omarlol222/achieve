import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type QuestionHeaderProps = {
  onAddClick: () => void;
};

export function QuestionHeader({ onAddClick }: QuestionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
}