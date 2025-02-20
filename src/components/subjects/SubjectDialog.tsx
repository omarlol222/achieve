import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type SubjectFormData = {
  name: string;
  description?: string;
  test_type_id: string;
};

type SubjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess: () => void;
};

export function SubjectDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: SubjectDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

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

  const form = useForm<SubjectFormData>({
    defaultValues: initialData || {
      name: "",
      description: "",
      test_type_id: "",
    },
  });

  const onSubmit = async (data: SubjectFormData) => {
    try {
      setIsSubmitting(true);

      if (initialData?.id) {
        const { error } = await supabase
          .from("subjects")
          .update(data)
          .eq("id", initialData.id);
        if (error) throw error;
        toast({
          title: "Subject updated successfully",
        });
      } else {
        const { error } = await supabase.from("subjects").insert(data);
        if (error) throw error;
        toast({
          title: "Subject created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="test_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a test type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {testTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                  ? "Update Subject"
                  : "Add Subject"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}