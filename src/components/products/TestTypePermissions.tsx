import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductFormData } from "./types";

export function TestTypePermissions({
  form,
}: {
  form: UseFormReturn<ProductFormData>;
}) {
  const { data: testTypes } = useQuery({
    queryKey: ["test-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const permissions = form.watch("permissions");

  return (
    <div className="space-y-6">
      <FormLabel>Test Type Permissions</FormLabel>
      {testTypes?.map((testType, index) => {
        const permission = permissions?.find(
          (p) => p.test_type_id === testType.id
        );
        const fieldArrayIndex = permissions?.findIndex(
          (p) => p.test_type_id === testType.id
        );

        return (
          <div key={testType.id} className="space-y-4 border p-4 rounded-lg">
            <h3 className="font-medium">{testType.name}</h3>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name={`permissions.${fieldArrayIndex}.test_type_id`}
                render={({ field }) => (
                  <input type="hidden" {...field} value={testType.id} />
                )}
              />

              <FormField
                control={form.control}
                name={`permissions.${fieldArrayIndex}.has_course`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Course Access
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`permissions.${fieldArrayIndex}.has_simulator`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Simulator Access
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`permissions.${fieldArrayIndex}.has_practice`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Practice Access
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}