import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";

type QuestionFormData = {
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: string;
  difficulty: string;
  topic_id: string;
  explanation?: string;
  question_type: string;
  passage_text?: string;
};

type QuestionFormFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
  topics: any[];
  subjects: any[];
};

export function QuestionFormFields({ form, topics, subjects }: QuestionFormFieldsProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const questionType = form.watch("question_type");
  
  const filteredTopics = topics?.filter(
    (topic) => !selectedSubject || topic.subject_id === selectedSubject
  );

  return (
    <>
      <FormField
        control={form.control}
        name="question_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="normal">Normal Question</SelectItem>
                <SelectItem value="passage">Passage-Based Question</SelectItem>
                <SelectItem value="analogy">Analogy Question</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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

      {questionType === "passage" && (
        <FormField
          control={form.control}
          name="passage_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passage Text</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="question_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question Text</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {[1, 2, 3, 4].map((num) => (
        <FormField
          key={num}
          control={form.control}
          name={`choice${num}` as keyof QuestionFormData}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choice {num}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <FormField
        control={form.control}
        name="correct_answer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correct Answer</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[1, 2, 3, 4].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    Choice {num}
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
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Difficulty Level</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    Level {level}
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
        name="explanation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Explanation (Optional)</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}