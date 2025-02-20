
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ProgressHeader } from "./progress/ProgressHeader";
import { ProgressGrid } from "./progress/ProgressGrid";

export function ProgressSection() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const { data: subjects } = useQuery({
    queryKey: ["subjects-with-progress"],
    queryFn: async () => {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          topics (
            id,
            name,
            subtopics (
              id,
              name,
              user_subtopic_progress (
                current_score
              )
            )
          )
        `);

      if (subjectsError) throw subjectsError;
      if (!subjectsData) return [];

      return subjectsData.map(subject => ({
        id: subject.id,
        name: subject.name,
        topics: subject.topics.map(topic => ({
          id: topic.id,
          name: topic.name,
          progress: { percentage: 0 }, // Changed from points to percentage
          subtopics: topic.subtopics?.map(st => ({
            id: st.id,
            name: st.name,
            progress: {
              points: st.user_subtopic_progress?.[0]?.current_score || 0
            }
          }))
        }))
      }));
    }
  });

  const calculateTopicProgress = (topicId: string) => {
    const topic = subjects?.flatMap(s => s.topics).find(t => t.id === topicId);
    if (!topic || !topic.subtopics) return { percentage: 0 };

    const validSubtopics = topic.subtopics.filter(st => st && st.progress && typeof st.progress.points === 'number');
    if (validSubtopics.length === 0) return { percentage: 0 };

    // Calculate completion percentage for each subtopic (out of 500 points max)
    const subtopicPercentages = validSubtopics.map(st => 
      Math.min((st.progress.points / 500) * 100, 100)
    );

    // Calculate the average completion percentage
    const totalPercentage = subtopicPercentages.reduce((sum, percentage) => sum + percentage, 0);
    const averagePercentage = totalPercentage / validSubtopics.length;
    
    return {
      percentage: averagePercentage
    };
  };

  if (!subjects) {
    return null;
  }

  return (
    <div className="space-y-8">
      <ProgressHeader />
      <ProgressGrid
        subjects={subjects}
        calculateTopicProgress={calculateTopicProgress}
        expandedSubject={expandedSubject}
        onToggleExpand={(subjectId) => setExpandedSubject(
          expandedSubject === subjectId ? null : subjectId
        )}
      />
    </div>
  );
}
