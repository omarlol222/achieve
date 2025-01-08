import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

type TopicFormData = {
  name: string;
  description?: string;
  subject_id: string;
  test_type_id: string;
};

type TopicFormFieldsProps = {
  form: UseFormReturn<TopicFormData>;
  subjects: any[];
  testTypes: any[];
};

export function TopicFormFields({ form, subjects, testTypes }: TopicFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="test_type_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Test Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a test type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {testTypes?.map((type) => (
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

      <FormField
        control={form.control}
        name="subject_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}