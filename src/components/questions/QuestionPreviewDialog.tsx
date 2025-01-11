import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { QuestionFormData } from "@/types/question";

type QuestionPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: QuestionFormData;
};

export function QuestionPreviewDialog({
  open,
  onOpenChange,
  formData,
}: QuestionPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Preview</DialogTitle>
        </DialogHeader>
        <QuestionContent
          question={{
            question_text: formData.question_text,
            choice1: formData.choice1,
            choice2: formData.choice2,
            choice3: formData.choice3,
            choice4: formData.choice4,
            correct_answer: parseInt(formData.correct_answer),
            explanation: formData.explanation,
            passage_text: formData.passage_text,
            image_url: formData.image_url,
            explanation_image_url: formData.explanation_image_url,
          }}
          selectedAnswer={null}
          onAnswerSelect={() => {}}
          showFeedback={true}
        />
      </DialogContent>
    </Dialog>
  );
}