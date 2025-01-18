import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SubtopicDialog } from "./SubtopicDialog";
import { SubtopicList } from "./SubtopicList";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function SubtopicManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState<any>(null);
  const [subtopicToDelete, setSubtopicToDelete] = useState<any>(null);

  const { data: subtopics } = useQuery({
    queryKey: ["subtopics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subtopics")
        .select("*, topic:topics(name)")
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
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    if (!subtopicToDelete) return;

    try {
      const { error } = await supabase
        .from("subtopics")
        .delete()
        .eq("id", subtopicToDelete.id);

      if (error) throw error;

      toast({
        title: "Subtopic deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["subtopics"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting subtopic",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubtopicToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Subtopics</h2>
        <Button onClick={() => {
          setSelectedSubtopic(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subtopic
        </Button>
      </div>

      <SubtopicList
        subtopics={subtopics || []}
        onEdit={(subtopic) => {
          setSelectedSubtopic(subtopic);
          setDialogOpen(true);
        }}
        onDelete={(subtopic) => {
          setSubtopicToDelete(subtopic);
          setDeleteDialogOpen(true);
        }}
      />

      <SubtopicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedSubtopic}
        topics={topics || []}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["subtopics"] });
        }}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Subtopic"
        description="Are you sure you want to delete this subtopic? This action cannot be undone."
      />
    </div>
  );
}