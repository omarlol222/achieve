import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type TestTypeFieldProps = {
  form: UseFormReturn<QuestionFormData>;
  testTypes: any[];
};

export function TestTypeField({ form, testTypes }: TestTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="test_type_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Test Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {testTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}