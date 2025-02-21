
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface SubtopicGridProps {
  subjectId: string;
  selectedSubtopics: string[];
  onSubtopicsChange: (subtopics: string[]) => void;
}

export const SubtopicGrid = ({ 
  subjectId, 
  selectedSubtopics, 
  onSubtopicsChange 
}: SubtopicGridProps) => {
  const { data: topics } = useQuery({
    queryKey: ["topics", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          subtopics (
            id,
            name
          )
        `)
        .eq("subject_id", subjectId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!subjectId
  });

  const handleSubtopicToggle = (subtopicId: string) => {
    if (selectedSubtopics.includes(subtopicId)) {
      onSubtopicsChange(selectedSubtopics.filter(id => id !== subtopicId));
    } else {
      onSubtopicsChange([...selectedSubtopics, subtopicId]);
    }
  };

  return (
    <div className="space-y-6">
      {topics?.map((topic) => (
        <Card key={topic.id} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{topic.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topic.subtopics?.map((subtopic) => (
              <div key={subtopic.id} className="flex items-center space-x-3">
                <Checkbox
                  id={subtopic.id}
                  checked={selectedSubtopics.includes(subtopic.id)}
                  onCheckedChange={() => handleSubtopicToggle(subtopic.id)}
                />
                <label
                  htmlFor={subtopic.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {subtopic.name}
                </label>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
