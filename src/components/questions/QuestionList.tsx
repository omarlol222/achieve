import { memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useVirtualizer } from "@tanstack/react-virtual";

type QuestionListProps = {
  questions: any[];
  isLoading: boolean;
  onEdit: (question: any) => void;
  onDelete: (question: any) => void;
};

const QuestionListRow = memo(
  ({
    question,
    onEdit,
    onDelete,
  }: {
    question: any;
    onEdit: (question: any) => void;
    onDelete: (question: any) => void;
  }) => {
    const getQuestionTypeBadge = (type: string) => {
      const colors = {
        normal: "bg-blue-100 text-blue-800",
        passage: "bg-purple-100 text-purple-800",
        analogy: "bg-green-100 text-green-800",
        comparison: "bg-orange-100 text-orange-800",
      };

      return (
        <Badge
          variant="secondary"
          className={colors[type as keyof typeof colors]}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    };

    const getDifficultyBadge = (difficulty: string) => {
      const colors = {
        Easy: "bg-green-100 text-green-800",
        Moderate: "bg-yellow-100 text-yellow-800",
        Hard: "bg-red-100 text-red-800",
      };

      return (
        <Badge
          variant="secondary"
          className={colors[difficulty as keyof typeof colors]}
        >
          {difficulty}
        </Badge>
      );
    };

    const renderQuestionContent = (question: any) => {
      if (question.question_type === "comparison") {
        return (
          <div className="space-y-2">
            <p className="mb-2">{question.question_text}</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="border-b p-2 text-center w-1/2 bg-gray-50">
                      A
                    </th>
                    <th className="border-b p-2 text-center w-1/2 bg-gray-50">
                      B
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-r p-4 text-center">
                      {question.comparison_value1}
                    </td>
                    <td className="p-4 text-center">
                      {question.comparison_value2}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      return (
        <>
          <div>{question.question_text}</div>
          {question.image_url && (
            <img
              src={question.image_url}
              alt="Question"
              className="mt-2 max-w-xs rounded-md"
              loading="lazy"
            />
          )}
        </>
      );
    };

    return (
      <TableRow>
        <TableCell className="font-medium">
          {renderQuestionContent(question)}
        </TableCell>
        <TableCell>{question.topic?.subject?.name || "Uncategorized"}</TableCell>
        <TableCell>{question.topic?.name || "Uncategorized"}</TableCell>
        <TableCell>{getQuestionTypeBadge(question.question_type)}</TableCell>
        <TableCell>{getDifficultyBadge(question.difficulty || "Easy")}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(question)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(question)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }
);

QuestionListRow.displayName = "QuestionListRow";

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