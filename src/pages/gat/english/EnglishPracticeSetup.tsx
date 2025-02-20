
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

export default function EnglishPracticeSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionsCount, setQuestionsCount] = useState(10);

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
      // Create a new practice session
      const { data: session, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          total_questions: questionsCount,
          subject: 'English',
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to the practice session
      navigate(`/gat/practice/${session.id}`);
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
              <h2 className="text-xl font-semibold">Number of Questions</h2>
              <div className="flex gap-4">
                {[5, 10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    variant={questionsCount === count ? "default" : "outline"}
                    onClick={() => setQuestionsCount(count)}
                  >
                    {count}
                  </Button>
                ))}
              </div>
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
