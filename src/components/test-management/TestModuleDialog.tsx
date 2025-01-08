import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BasicFields } from "./form-fields/BasicFields";
import { SelectFields } from "./form-fields/SelectFields";
import { TestModuleFormData } from "./types";

type TestModuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: any[];
  testTemplates: any[];
  testTypes: any[];
  onSuccess: () => void;
};

export function TestModuleDialog({
  open,
  onOpenChange,
  subjects,
  testTypes,
  onSuccess,
}: TestModuleDialogProps) {
  const { toast } = useToast();
  const form = useForm<TestModuleFormData>({
    defaultValues: {
      name: "",
      description: "",
      time_limit: 0,
      subject_id: "",
      test_type_id: "",
    },
  });

  const onSubmit = async (data: TestModuleFormData) => {
    try {
      const { error } = await supabase.from("test_modules").insert([data]);

      if (error) throw error;

      toast({
        title: "Test module created successfully",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating test module",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Test Module</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicFields form={form} />
            <SelectFields 
              form={form} 
              subjects={subjects} 
              testTypes={testTypes} 
            />
            <Button type="submit" className="w-full">
              Create Module
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}