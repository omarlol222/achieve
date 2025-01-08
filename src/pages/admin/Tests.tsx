import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Tests = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newModule, setNewModule] = useState({
    name: "",
    description: "",
    time_limit: 0,
    subject_id: "",
    test_template_id: "",
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

  // Fetch test modules with subject information
  const { data: modules, refetch } = useQuery({
    queryKey: ["test-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_modules")
        .select(`
          *,
          subjects (name),
          test_templates (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create new test module
  const handleCreateModule = async () => {
    try {
      const { error } = await supabase.from("test_modules").insert([
        {
          name: newModule.name,
          description: newModule.description,
          time_limit: newModule.time_limit,
          subject_id: newModule.subject_id,
          test_template_id: newModule.test_template_id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test module created successfully",
      });

      setIsOpen(false);
      setNewModule({
        name: "",
        description: "",
        time_limit: 0,
        subject_id: "",
        test_template_id: "",
      });
      refetch();
    } catch (error) {
      console.error("Error creating module:", error);
      toast({
        title: "Error",
        description: "Failed to create test module",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Test Module Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Test Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newModule.name}
                  onChange={(e) =>
                    setNewModule({ ...newModule, name: e.target.value })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newModule.description}
                  onChange={(e) =>
                    setNewModule({ ...newModule, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Test Template</Label>
                <Select
                  value={newModule.test_template_id}
                  onValueChange={(value) =>
                    setNewModule({ ...newModule, test_template_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTemplates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={newModule.subject_id}
                  onValueChange={(value) =>
                    setNewModule({ ...newModule, subject_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time Limit (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  value={newModule.time_limit}
                  onChange={(e) =>
                    setNewModule({
                      ...newModule,
                      time_limit: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <Button onClick={handleCreateModule} className="w-full">
                Create Module
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Time Limit (min)</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules?.map((module) => (
            <TableRow key={module.id}>
              <TableCell>{module.name}</TableCell>
              <TableCell>{module.description}</TableCell>
              <TableCell>{module.subjects?.name}</TableCell>
              <TableCell>{module.test_templates?.name}</TableCell>
              <TableCell>{module.time_limit}</TableCell>
              <TableCell>
                {new Date(module.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Tests;