import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TopicDialog } from "./TopicDialog";
import { TopicList } from "./TopicList";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TopicManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [topicToDelete, setTopicToDelete] = useState<any>(null);

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, subject:subjects(name), test_type:test_types(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

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

  const handleDelete = async () => {
    if (!topicToDelete) return;

    try {
      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", topicToDelete.id);

      if (error) throw error;

      toast({
        title: "Topic deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["topics"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting topic",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Topics</h2>
        <Button onClick={() => {
          setSelectedTopic(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>

      <TopicList
        topics={topics || []}
        onEdit={(topic) => {
          setSelectedTopic(topic);
          setDialogOpen(true);
        }}
        onDelete={(topic) => {
          setTopicToDelete(topic);
          setDeleteDialogOpen(true);
        }}
      />

      <TopicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedTopic}
        subjects={subjects || []}
        testTypes={testTypes || []}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["topics"] });
        }}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Topic"
        description="Are you sure you want to delete this topic? This action cannot be undone."
      />
    </div>
  );
}