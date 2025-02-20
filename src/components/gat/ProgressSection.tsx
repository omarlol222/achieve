
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
                points
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
          progress: { percentage: 0 },
          subtopics: topic.subtopics?.map(st => ({
            id: st.id,
            name: st.name,
            progress: {
              points: st.user_subtopic_progress?.[0]?.points || 0
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

    // Calculate total points and max possible points
    let totalPoints = 0;
    const maxPointsPerSubtopic = 500; // Maximum points possible per subtopic
    const maxTotalPoints = validSubtopics.length * maxPointsPerSubtopic;

    // Sum up all points
    totalPoints = validSubtopics.reduce((sum, st) => {
      const points = st.progress.points || 0;
      return sum + points;
    }, 0);

    // Calculate percentage based on total points achieved vs maximum possible points
    const percentage = (totalPoints / maxTotalPoints) * 100;
    
    return {
      percentage: Math.min(percentage, 100) // Ensure we don't exceed 100%
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
