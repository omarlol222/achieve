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
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Tests = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    total_time: 0,
  });

  // Fetch test templates
  const { data: tests, refetch } = useQuery({
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

  // Create new test template
  const handleCreateTest = async () => {
    try {
      const { error } = await supabase.from("test_templates").insert([
        {
          name: newTest.name,
          description: newTest.description,
          total_time: newTest.total_time,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test template created successfully",
      });

      setIsOpen(false);
      setNewTest({ name: "", description: "", total_time: 0 });
      refetch();
    } catch (error) {
      console.error("Error creating test:", error);
      toast({
        title: "Error",
        description: "Failed to create test template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Test Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Test Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newTest.name}
                  onChange={(e) =>
                    setNewTest({ ...newTest, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTest.description}
                  onChange={(e) =>
                    setNewTest({ ...newTest, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="time">Total Time (minutes)</Label>
                <Input
                  id="time"
                  type="number"
                  value={newTest.total_time}
                  onChange={(e) =>
                    setNewTest({
                      ...newTest,
                      total_time: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <Button onClick={handleCreateTest}>Create Test</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Total Time (min)</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests?.map((test) => (
            <TableRow key={test.id}>
              <TableCell>{test.name}</TableCell>
              <TableCell>{test.description}</TableCell>
              <TableCell>{test.total_time}</TableCell>
              <TableCell>
                {new Date(test.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Tests;