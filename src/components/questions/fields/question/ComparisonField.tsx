
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type ComparisonFieldProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function ComparisonField({ form }: ComparisonFieldProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="comparison_value1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Value</FormLabel>
              <FormControl>
                <Input placeholder="Enter first value" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comparison_value2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Second Value</FormLabel>
              <FormControl>
                <Input placeholder="Enter second value" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="border rounded-lg overflow-hidden mt-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border-b p-2 text-center w-1/2">A</th>
              <th className="border-b p-2 text-center w-1/2">B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r p-4">
                <div className="text-center">
                  {form.watch("comparison_value1") || "First Value"}
                </div>
              </td>
              <td className="p-4">
                <div className="text-center">
                  {form.watch("comparison_value2") || "Second Value"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
