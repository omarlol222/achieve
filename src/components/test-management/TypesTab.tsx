
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TestTypeList } from "./TestTypeList";
import { TestTypeDialog } from "./TestTypeDialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { supabase } from "@/integrations/supabase/client";

type TypesTabProps = {
  testTypes: any[];
};

export function TypesTab({ testTypes }: TypesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testTypeToDelete, setTestTypeToDelete] = useState<any>(null);

  const handleDeleteTestType = async () => {
    if (!testTypeToDelete) return;

    try {
      const { error } = await supabase
        .from("test_types")
        .delete()
        .eq("id", testTypeToDelete.id);

      if (error) throw error;

      toast({
        title: "Test type deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["test-types"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting test type",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setTestTypeToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Test Type Management</h2>
        <Button
          onClick={() => {
            setSelectedTestType(null);
            setTypeDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Test Type
        </Button>
      </div>

      <TestTypeList
        testTypes={testTypes}
        onEdit={(testType) => {
          setSelectedTestType(testType);
          setTypeDialogOpen(true);
        }}
        onDelete={(testType) => {
          setTestTypeToDelete(testType);
          setDeleteDialogOpen(true);
        }}
      />

      <TestTypeDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        initialData={selectedTestType}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["test-types"] });
        }}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteTestType}
        title="Delete Test Type"
        description="Are you sure you want to delete this test type? This action cannot be undone."
      />
    </div>
  );
}
