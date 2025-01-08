import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestTypeList } from "@/components/test-management/TestTypeList";
import { TestTypeDialog } from "@/components/test-management/TestTypeDialog";
import { TestModuleList } from "@/components/test-management/TestModuleList";
import { TestModuleDialog } from "@/components/test-management/TestModuleDialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";

const Tests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testTypeToDelete, setTestTypeToDelete] = useState<any>(null);

  // Fetch test types
  const { data: testTypes } = useQuery({
    queryKey: ["test-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch test templates
  const { data: testTemplates } = useQuery({
    queryKey: ["test-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch test modules with related information
  const { data: modules } = useQuery({
    queryKey: ["test-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_modules")
        .select(`
          *,
          subjects (name),
          test_templates (name),
          test_types (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
    <div className="container mx-auto py-8">
      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Test Modules</TabsTrigger>
          <TabsTrigger value="types">Test Types</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Test Module Management</h2>
            <Button onClick={() => setModuleDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Module
            </Button>
          </div>

          <TestModuleList modules={modules || []} />

          <TestModuleDialog
            open={moduleDialogOpen}
            onOpenChange={setModuleDialogOpen}
            subjects={subjects || []}
            testTemplates={testTemplates || []}
            testTypes={testTypes || []}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["test-modules"] });
            }}
          />
        </TabsContent>

        <TabsContent value="types" className="mt-6">
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
            testTypes={testTypes || []}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tests;