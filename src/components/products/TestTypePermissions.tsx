import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export function TestTypePermissions<T extends FieldValues>({ 
  form 
}: { 
  form: UseFormReturn<T>
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

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Test Type Permissions</h3>
      
      {testTypes?.map((testType) => {
        const permissionIndex = (form.getValues().permissions as any[])?.findIndex(
          (p: any) => p.test_type_id === testType.id
        ) ?? -1;

        const fieldName = permissionIndex === -1
          ? `permissions.${(form.getValues().permissions as any[])?.length ?? 0}`
          : `permissions.${permissionIndex}`;

        return (
          <div key={testType.id} className="space-y-2">
            <div className="font-medium text-sm">{testType.name}</div>
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name={`${fieldName}.test_type_id` as Path<T>}
                defaultValue={testType.id as PathValue<T, Path<T>>}
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />

              <FormField
                control={form.control}
                name={`${fieldName}.has_course` as Path<T>}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel className="text-sm font-normal">
                      Course Access
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`${fieldName}.has_simulator` as Path<T>}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel className="text-sm font-normal">
                      Simulator Access
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`${fieldName}.has_practice` as Path<T>}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel className="text-sm font-normal">
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