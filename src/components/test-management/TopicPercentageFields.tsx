import { useQuery } from "@tanstack/react-query";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TestModuleFormData } from "./types";

type TopicPercentageFieldsProps = {
  form: UseFormReturn<TestModuleFormData>;
  subjectId: string | undefined;
};

export function TopicPercentageFields({ form, subjectId }: TopicPercentageFieldsProps) {
  // Fetch topics for the selected subject
  const { data: topics } = useQuery({
    queryKey: ["topics", subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", subjectId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!subjectId,
  });

  if (!topics?.length) return null;

  // Get the current form values for debugging
  const currentValues = form.getValues();
  console.log("Current form values:", currentValues);
  console.log("Current topic_percentages:", currentValues.topic_percentages);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Topic Configuration</h3>
      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <FormField
            key={topic.id}
            control={form.control}
            name={`topic_percentages.${topic.id}`}
            render={({ field }) => {
              const currentValue = Number(field.value) || 0;
              console.log(`Topic ${topic.name} (${topic.id}) current value:`, currentValue);
              
              return (
                <div className="space-y-4 border p-4 rounded-lg">
                  <h4 className="font-medium">{topic.name}</h4>
                  <FormItem>
                    <FormLabel>Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        value={currentValue}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                          field.onChange(value);
                          console.log(`Setting ${topic.name} (${topic.id}) to ${value}%`);
                          console.log("Form state after change:", form.getValues());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}