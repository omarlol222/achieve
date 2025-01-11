import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Module Details</h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40%]">Module Name</TableHead>
              <TableHead className="w-[20%]">Type</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead className="text-right">Correct</TableHead>
              <TableHead className="text-right w-[15%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules?.map((progress) => {
              const totalQuestions = progress.module_answers?.length || 0;
              const correctAnswers = progress.module_answers?.filter(
                (answer) => answer.selected_answer === answer.question.correct_answer
              ).length || 0;
              
              return (
                <TableRow key={progress.id}>
                  <TableCell className="font-medium">
                    {progress.module.name}
                  </TableCell>
                  <TableCell>{progress.module.test_type?.name}</TableCell>
                  <TableCell className="text-right">{totalQuestions}</TableCell>
                  <TableCell className="text-right">{correctAnswers}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onModuleSelect(progress.id)}
                    >
                      See questions
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}