import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PracticeSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number>(10);

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: topics } = useQuery({
    queryKey: ["topics", selectedSubject],
    enabled: !!selectedSubject,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", selectedSubject)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleStartPractice = () => {
    if (!selectedTopics.length) {
      toast({
        variant: "destructive",
        title: "Please select at least one topic",
      });
      return;
    }

    navigate("/practice/test", {
      state: {
        subjectId: selectedSubject,
        topicIds: selectedTopics,
        difficulty,
        questionCount,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-[#1B2B2B]">
          Practice Mode Setup
        </h1>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  setSelectedTopics([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Topics</Label>
              <Select
                value={selectedTopics[0]}
                onValueChange={(value) => setSelectedTopics([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select topics" />
                </SelectTrigger>
                <SelectContent>
                  {topics?.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleStartPractice}
          >
            Start Practice
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PracticeSetup;