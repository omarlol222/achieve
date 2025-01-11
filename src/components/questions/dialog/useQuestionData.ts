import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuestionData() {
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
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, subject:subjects(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: testTypes } = useQuery({
    queryKey: ["testTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return { subjects, topics, testTypes };
}