import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { QuestionFormFields } from "./QuestionFormFields";
import { QuestionPreviewDialog } from "./QuestionPreviewDialog";
import { useQuestionForm } from "./dialog/useQuestionForm";
import { useQuestionData } from "./dialog/useQuestionData";
import { useQuestionSubmit } from "./dialog/useQuestionSubmit";

type QuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess: () => void;
};

export function QuestionDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: QuestionDialogProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const form = useQuestionForm(initialData);
  const { subjects, topics, testTypes } = useQuestionData();
  const { handleSubmit, isSubmitting } = useQuestionSubmit(onSuccess, onOpenChange);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => handleSubmit(data, initialData))} className="space-y-4">
              <QuestionFormFields 
                form={form} 
                topics={topics || []} 
                subjects={subjects || []}
                testTypes={testTypes || []}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview Question
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : initialData
                    ? "Update Question"
                    : "Add Question"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <QuestionPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        formData={form.getValues()}
      />
    </>
  );
}