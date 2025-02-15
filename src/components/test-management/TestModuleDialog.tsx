
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useTestModuleForm } from "./hooks/useTestModuleForm";
import { TestModuleDialogForm } from "./TestModuleDialogForm";
import { createTestModule, updateTestModule, deleteModuleTopics, createModuleTopics } from "./services/testModuleService";
import type { TestModuleFormData } from "./types";

type TestModuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: any[];
  testTypes: any[];
  onSuccess: () => void;
  initialData?: any;
};

export function TestModuleDialog({
  open,
  onOpenChange,
  subjects,
  testTypes,
  onSuccess,
  initialData,
}: TestModuleDialogProps) {
  const { toast } = useToast();
  const form = useTestModuleForm(initialData);

  const onSubmit = async (data: TestModuleFormData) => {
    try {
      console.log("Submitting form data:", data);
      let moduleId;

      if (initialData) {
        console.log("Updating existing module:", initialData.id);
        moduleId = await updateTestModule(initialData.id, data);
        await deleteModuleTopics(moduleId);
      } else {
        console.log("Creating new module");
        const moduleData = await createTestModule(data);
        moduleId = moduleData.id;
      }

      await createModuleTopics(moduleId, data);

      toast({
        title: `Test module ${initialData ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        variant: "destructive",
        title: `Error ${initialData ? 'updating' : 'creating'} test module`,
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit' : 'Create New'} Test Module
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(85vh-120px)]">
            <div className="pr-4">
              <TestModuleDialogForm
                form={form}
                onSubmit={onSubmit}
                subjects={subjects}
                testTypes={testTypes}
                initialData={initialData}
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
