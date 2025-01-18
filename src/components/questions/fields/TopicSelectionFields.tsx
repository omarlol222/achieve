import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TopicSelectionFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
  topics: any[];
  subjects: any[];
};

export function TopicSelectionFields({ form, topics, subjects }: TopicSelectionFieldsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  
  const filteredTopics = topics?.filter(
    (topic) => !selectedSubject || topic.subject_id === selectedSubject
  );

  const { data: subtopics } = useQuery({
    queryKey: ["subtopics", selectedTopic],
    queryFn: async () => {
      if (!selectedTopic) return [];
      const { data, error } = await supabase
        .from("subtopics")
        .select("*")
        .eq("topic_id", selectedTopic)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTopic,
  });

  useEffect(() => {
    const topicId = form.getValues("topic_id");
    if (topicId) {
      const topic = topics?.find(t => t.id === topicId);
      if (topic) {
        setSelectedSubject(topic.subject_id);
        setSelectedTopic(topicId);
      }
    }
  }, [topics, form]);

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
                form.setValue("subtopic_id", "");
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
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                setSelectedTopic(value);
                form.setValue("subtopic_id", "");
              }} 
              value={field.value}
            >
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

          <FormField
            control={form.control}
            name="subtopic_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtopic (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subtopic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subtopics?.map((subtopic) => (
                      <SelectItem key={subtopic.id} value={subtopic.id}>
                        {subtopic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    />
  );
}