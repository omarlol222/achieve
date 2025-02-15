
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";

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
  const moduleStats = useMemo(() => 
    modules?.map((progress) => {
      const totalQuestions = progress.module_answers?.length || 0;
      const correctAnswers = progress.module_answers?.filter(
        (answer) => answer.selected_answer === answer.question.correct_answer
      ).length || 0;
      
      return {
        id: progress.id,
        name: progress.module.name,
        typeName: progress.module.test_type?.name,
        totalQuestions,
        correctAnswers,
      };
    }),
    [modules]
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Module Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleStats?.map((stats) => (
          <Card key={stats.id} className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{stats.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.typeName}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p>Questions: {stats.totalQuestions}</p>
                <p>Correct: {stats.correctAnswers}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => onModuleSelect(stats.id)}
                className="w-full"
              >
                See questions
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
