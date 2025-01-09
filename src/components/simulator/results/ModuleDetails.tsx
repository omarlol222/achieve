import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ModuleProgress = {
  id: string;
  module: {
    name: string;
    test_type?: {
      name: string;
    };
  };
  module_answers?: {
    selected_answer: number;
    question: {
      correct_answer: number;
    };
  }[];
};

type ModuleDetailsProps = {
  modules: ModuleProgress[];
  onModuleSelect: (moduleId: string) => void;
};

export function ModuleDetails({ modules, onModuleSelect }: ModuleDetailsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Module Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules?.map((progress) => {
          const totalQuestions = progress.module_answers?.length || 0;
          const correctAnswers = progress.module_answers?.filter(
            (answer) => answer.selected_answer === answer.question.correct_answer
          ).length || 0;
          
          return (
            <Card key={progress.id} className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {progress.module.name}
                <span className="text-sm text-gray-500 block">
                  {progress.module.test_type?.name}
                </span>
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">TOTAL QUESTIONS: </span>
                  {totalQuestions}
                </p>
                <p>
                  <span className="font-medium">CORRECT: </span>
                  {correctAnswers}
                </p>
              </div>
              <Button
                className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C]"
                onClick={() => onModuleSelect(progress.id)}
              >
                See questions
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}