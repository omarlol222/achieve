import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name={`permissions.${fieldArrayIndex}.has_course`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue(
                                `permissions.${fieldArrayIndex}.course_text`,
                                ""
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Course Access
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {permission?.has_course && (
                  <FormField
                    control={form.control}
                    name={`permissions.${fieldArrayIndex}.course_text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Access to ${testType.name} Course`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name={`permissions.${fieldArrayIndex}.has_simulator`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue(
                                `permissions.${fieldArrayIndex}.simulator_text`,
                                ""
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Simulator Access
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {permission?.has_simulator && (
                  <FormField
                    control={form.control}
                    name={`permissions.${fieldArrayIndex}.simulator_text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Access to ${testType.name} Simulator`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name={`permissions.${fieldArrayIndex}.has_practice`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue(
                                `permissions.${fieldArrayIndex}.practice_text`,
                                ""
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Practice Access
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {permission?.has_practice && (
                  <FormField
                    control={form.control}
                    name={`permissions.${fieldArrayIndex}.practice_text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Access to ${testType.name} Practice`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}