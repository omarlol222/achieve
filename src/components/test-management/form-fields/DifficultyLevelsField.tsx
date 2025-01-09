import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { TestModuleFormData } from "../types";

const DIFFICULTY_OPTIONS = ["Easy", "Moderate", "Hard"];

interface DifficultyLevelsFieldProps {
  form: UseFormReturn<TestModuleFormData>;
}

export function DifficultyLevelsField({ form }: DifficultyLevelsFieldProps) {
  const difficultyLevels = form.watch("difficulty_levels") || [];

  return (
    <FormField
      control={form.control}
      name="difficulty_levels"
      render={() => (
        <FormItem>
          <FormLabel>Difficulty Levels</FormLabel>
          <div className="grid grid-cols-3 gap-4">
            {DIFFICULTY_OPTIONS.map((level) => (
              <FormField
                key={level}
                control={form.control}
                name="difficulty_levels"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(level)}
                        onCheckedChange={(checked) => {
                          const updatedLevels = checked
                            ? [...field.value || [], level]
                            : field.value?.filter((val: string) => val !== level) || [];
                          field.onChange(updatedLevels);
                        }}
                      />
                    </FormControl>
                    <span>{level}</span>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}