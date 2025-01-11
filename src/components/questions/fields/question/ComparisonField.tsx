import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type ComparisonFieldProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function ComparisonField({ form }: ComparisonFieldProps) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
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
                  {form.getValues("comparison_value1") || "First Value"}
                </div>
              </td>
              <td className="p-4">
                <div className="text-center">
                  {form.getValues("comparison_value2") || "Second Value"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}