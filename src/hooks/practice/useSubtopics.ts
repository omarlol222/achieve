
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSubtopics(subject: string | undefined) {
  return useQuery({
    queryKey: ["subject-subtopics", subject],
    queryFn: async () => {
      if (!subject) {
        console.log("No subject provided");
        return [];
      }

      console.log("Fetching subtopics for subject:", subject);

      // Get subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subject)
        .single();

      if (subjectError) {
        console.error("Subject fetch error:", subjectError);
        throw subjectError;
      }
      
      if (!subjectData) {
        console.error(`Subject "${subject}" not found`);
        return [];
      }

      console.log("Found subject:", subjectData);

      // First get all topics for this subject
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id")
        .eq("subject_id", subjectData.id);

      if (topicsError) {
        console.error("Topics fetch error:", topicsError);
        throw topicsError;
      }

      const topicIds = topicsData.map(topic => topic.id);

      if (topicIds.length === 0) {
        console.log("No topics found for subject");
        return [];
      }

      // Then get subtopics for these topics
      const { data: subtopicsData, error: subtopicsError } = await supabase
        .from("subtopics")
        .select("id")
        .in("topic_id", topicIds);

      if (subtopicsError) {
        console.error("Subtopics fetch error:", subtopicsError);
        throw subtopicsError;
      }

      const subtopicIds = subtopicsData.map(st => st.id);
      console.log("Found subtopic IDs:", subtopicIds);

      return subtopicIds;
    },
    enabled: !!subject
  });
}
