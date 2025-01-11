import { memo } from "react";
import { QuestionListRow } from "./list/QuestionListRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type QuestionListProps = {
  questions: any[];
  isLoading: boolean;
  onEdit: (question: any) => void;
  onDelete: (question: any) => void;
};

export const QuestionList = memo(function QuestionList({
  questions,
  isLoading,
  onEdit,
  onDelete,
}: QuestionListProps) {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading questions...
              </TableCell>
            </TableRow>
          ) : questions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No questions found. Add your first question to get started.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <QuestionListRow
                key={question.id}
                question={question}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});