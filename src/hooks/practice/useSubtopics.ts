
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSubtopics(subject: string | undefined) {
  return useQuery({
    queryKey: ["subject-subtopics", subject],
    queryFn: async () => {
      if (!subject) return [];

      // Get subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", subject)
        .single();

      if (subjectError) throw subjectError;
      if (!subjectData) throw new Error(`Subject "${subject}" not found`);

      // Get topic IDs for the subject
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id, subtopics(id)")
        .eq("subject_id", subjectData.id);

      if (topicsError) throw topicsError;
      if (!topicsData || topicsData.length === 0) {
        throw new Error(`No topics found for subject "${subject}"`);
      }

      // Get all subtopic IDs
      return topicsData.flatMap(t => 
        (t.subtopics || []).map(st => st.id)
      ).filter(Boolean);
    },
    enabled: !!subject
  });
}
