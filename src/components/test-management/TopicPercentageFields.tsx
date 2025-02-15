
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

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Topic Configuration</h3>
      
      <div className="border p-4 rounded-lg mb-4">
        <FormField
          control={form.control}
          name="total_questions"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Total Questions</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  {...field}
                  value={value || ""}
                  onChange={(e) => {
                    const newValue = e.target.value ? parseInt(e.target.value) : "";
                    onChange(newValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <FormField
            key={topic.id}
            control={form.control}
            name={`topic_percentages.${topic.id}`}
            render={({ field: { value, onChange, ...field } }) => (
              <div className="space-y-4 border p-4 rounded-lg">
                <h4 className="font-medium">{topic.name}</h4>
                <FormItem>
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="100"
                      {...field}
                      value={value || ""}
                      onChange={(e) => {
                        const newValue = e.target.value ? parseInt(e.target.value) : "";
                        onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />
        ))}
      </div>
    </div>
  );
}
