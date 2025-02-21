import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePracticeStore } from "@/store/practice";

type QuestionCount = 10 | 20 | 30 | -1; // -1 represents infinite mode

export default function EnglishPracticeSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionsCount, setQuestionsCount] = useState<QuestionCount>(10);
  const { actions: { resetSession } } = usePracticeStore();

  // Fetch English subject ID first
  const { data: englishSubject } = useQuery({
    queryKey: ['english-subject'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', 'English')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Then fetch topics for English
  const { data: topics } = useQuery({
    queryKey: ['english-topics', englishSubject?.id],
    queryFn: async () => {
      if (!englishSubject?.id) return [];
      
      const { data, error } = await supabase
        .from('topics')
        .select(`
          id,
          name,
          description,
          subtopics (
            id,
            name
          )
        `)
        .eq('subject_id', englishSubject.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!englishSubject?.id
  });

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  const handleStartPractice = async () => {
    if (selectedTopics.length === 0) {
      toast({
        title: "No topics selected",
        description: "Please select at least one topic to practice.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Reset the practice session state
      resetSession();

      // Get all subtopics for selected topics
      const { data: subtopics, error: subtopicsError } = await supabase
        .from('subtopics')
        .select('id')
        .in('topic_id', selectedTopics);

      if (subtopicsError) throw subtopicsError;

      // Create a new practice session
      const { data: session, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          total_questions: questionsCount === -1 ? 999 : questionsCount,
          subject: 'English',
          status: 'in_progress',
          subtopic_attempts: { subtopics: subtopics.map(st => st.id) }
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/gat/english/practice/${session.id}`);
    } catch (error: any) {
      toast({
        title: "Error starting practice",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/gat/english")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to English
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1B2B2B]">English Practice Setup</h1>
          <p className="mt-4 text-lg text-gray-600">Select the topics you want to practice</p>
        </div>

        <Card className="p-6">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Available Topics</h2>
              <div className="grid gap-4">
                {topics?.map((topic) => (
                  <div key={topic.id} className="flex items-start space-x-3">
                    <Checkbox 
                      id={topic.id}
                      checked={selectedTopics.includes(topic.id)}
                      onCheckedChange={() => handleTopicToggle(topic.id)}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor={topic.id} className="font-medium">
                        {topic.name}
                      </Label>
                      {topic.description && (
                        <p className="text-sm text-gray-500">
                          {topic.description}
                        </p>
                      )}
                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <p className="text-sm text-gray-500">
                          Includes: {topic.subtopics.map(st => st.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">Number of Questions</Label>
              <RadioGroup
                defaultValue="10"
                onValueChange={(value) => setQuestionsCount(parseInt(value) as QuestionCount)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="q10"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="10" id="q10" className="sr-only" />
                  <span className="text-xl font-bold">10</span>
                  <span className="text-sm text-gray-500">Questions</span>
                </Label>
                <Label
                  htmlFor="q20"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="20" id="q20" className="sr-only" />
                  <span className="text-xl font-bold">20</span>
                  <span className="text-sm text-gray-500">Questions</span>
                </Label>
                <Label
                  htmlFor="q30"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="30" id="q30" className="sr-only" />
                  <span className="text-xl font-bold">30</span>
                  <span className="text-sm text-gray-500">Questions</span>
                </Label>
                <Label
                  htmlFor="infinite"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="-1" id="infinite" className="sr-only" />
                  <span className="text-xl font-bold">∞</span>
                  <span className="text-sm text-gray-500">Infinite Mode</span>
                </Label>
              </RadioGroup>
            </div>

            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={handleStartPractice}
              disabled={selectedTopics.length === 0}
            >
              Start Practice
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
