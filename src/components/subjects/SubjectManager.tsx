import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SubjectDialog } from "./SubjectDialog";
import { SubjectList } from "./SubjectList";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function SubjectManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<any>(null);

  const { data: subjects, isLoading } = useQuery({
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

  const handleDelete = async () => {
    if (!subjectToDelete) return;

    try {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subjectToDelete.id);

      if (error) throw error;

      toast({
        title: "Subject deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting subject",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Subjects</h2>
        <Button onClick={() => {
          setSelectedSubject(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <SubjectList
        subjects={subjects || []}
        onEdit={(subject) => {
          setSelectedSubject(subject);
          setDialogOpen(true);
        }}
        onDelete={(subject) => {
          setSubjectToDelete(subject);
          setDeleteDialogOpen(true);
        }}
      />

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedSubject}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["subjects"] });
        }}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This action cannot be undone."
      />
    </div>
  );
}