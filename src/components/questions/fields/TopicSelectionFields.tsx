import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

type QuestionFormData = {
  topic_id: string;
  [key: string]: any;
};

type TopicSelectionFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
  topics: any[];
  subjects: any[];
};

export function TopicSelectionFields({ form, topics, subjects }: TopicSelectionFieldsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  
  const filteredTopics = topics?.filter(
    (topic) => !selectedSubject || topic.subject_id === selectedSubject
  );

  return (
    <FormField
      control={form.control}
      name="topic_id"
      render={({ field }) => (
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <Select 
              onValueChange={(value) => {
                setSelectedSubject(value);
                field.onChange("");
              }}
              value={selectedSubject}
            >
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
          </FormItem>

          <FormItem>
            <FormLabel>Topic</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredTopics?.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </div>
      )}
    />
  );
}