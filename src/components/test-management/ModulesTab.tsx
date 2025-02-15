
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TestModuleList } from "./TestModuleList";
import { TestModuleDialog } from "./TestModuleDialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { supabase } from "@/integrations/supabase/client";

type ModulesTabProps = {
  modules: any[];
  subjects: any[];
  testTypes: any[];
};

export function ModulesTab({ modules, subjects, testTypes }: ModulesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [moduleToDelete, setModuleToDelete] = useState<any>(null);
  const [moduleDeleteDialogOpen, setModuleDeleteDialogOpen] = useState(false);

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;

    try {
      // First, delete module_answers related to this module's progress
      const { data: moduleProgress, error: progressError } = await supabase
        .from("module_progress")
        .select("id")
        .eq("module_id", moduleToDelete.id);

      if (progressError) throw progressError;

      if (moduleProgress && moduleProgress.length > 0) {
        const progressIds = moduleProgress.map(p => p.id);
        
        // Delete related module answers
        const { error: answersError } = await supabase
          .from("module_answers")
          .delete()
          .in("module_progress_id", progressIds);

        if (answersError) throw answersError;

        // Delete module progress records
        const { error: deleteProgressError } = await supabase
          .from("module_progress")
          .delete()
          .eq("module_id", moduleToDelete.id);

        if (deleteProgressError) throw deleteProgressError;
      }

      // Delete module topics
      const { error: topicsError } = await supabase
        .from("module_topics")
        .delete()
        .eq("module_id", moduleToDelete.id);

      if (topicsError) throw topicsError;

      // Delete module questions
      const { error: questionsError } = await supabase
        .from("module_questions")
        .delete()
        .eq("module_id", moduleToDelete.id);

      if (questionsError) throw questionsError;

      // Finally delete the module
      const { error: moduleError } = await supabase
        .from("test_modules")
        .delete()
        .eq("id", moduleToDelete.id);

      if (moduleError) throw moduleError;

      toast({
        title: "Test module deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["test-modules"] });
    } catch (error: any) {
      console.error("Error deleting test module:", error);
      toast({
        variant: "destructive",
        title: "Error deleting test module",
        description: error.message,
      });
    } finally {
      setModuleDeleteDialogOpen(false);
      setModuleToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Test Module Management</h2>
        <Button onClick={() => {
          setSelectedModule(null);
          setModuleDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Module
        </Button>
      </div>

      <TestModuleList 
        modules={modules} 
        onEdit={(module) => {
          setSelectedModule(module);
          setModuleDialogOpen(true);
        }}
        onDelete={(module) => {
          setModuleToDelete(module);
          setModuleDeleteDialogOpen(true);
        }}
      />

      <TestModuleDialog
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        subjects={subjects}
        testTypes={testTypes}
        initialData={selectedModule}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["test-modules"] });
        }}
      />

      <DeleteDialog
        open={moduleDeleteDialogOpen}
        onOpenChange={setModuleDeleteDialogOpen}
        onConfirm={handleDeleteModule}
        title="Delete Test Module"
        description="Are you sure you want to delete this test module? This action cannot be undone."
      />
    </div>
  );
}
