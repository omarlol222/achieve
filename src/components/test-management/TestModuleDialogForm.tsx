
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { BasicFields } from "./form-fields/BasicFields";
import { SelectFields } from "./form-fields/SelectFields";
import { TopicPercentageFields } from "./TopicPercentageFields";
import { DifficultyLevelsField } from "./form-fields/DifficultyLevelsField";
import type { UseFormReturn } from "react-hook-form";
import type { TestModuleFormData } from "./types";

interface TestModuleDialogFormProps {
  form: UseFormReturn<TestModuleFormData>;
  onSubmit: (data: TestModuleFormData) => Promise<void>;
  subjects: any[];
  testTypes: any[];
  initialData?: any;
}

export function TestModuleDialogForm({
  form,
  onSubmit,
  subjects,
  testTypes,
  initialData,
}: TestModuleDialogFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicFields form={form} />
        <SelectFields 
          form={form} 
          subjects={subjects} 
          testTypes={testTypes} 
        />
        <DifficultyLevelsField form={form} />
        <TopicPercentageFields 
          form={form}
          subjectId={form.watch("subject_id")}
        />
        <Button type="submit" className="w-full">
          {initialData ? 'Update' : 'Create'} Module
        </Button>
      </form>
    </Form>
  );
}
