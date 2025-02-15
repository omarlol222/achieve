
import { supabase } from "@/integrations/supabase/client";

export async function getModuleByIndex(currentModuleIndex: number) {
  const { data: modules, error: modulesError } = await supabase
    .from("test_modules")
    .select(`
      id,
      name,
      subject_id,
      test_type_id,
      total_questions,
      subject:subjects (
        id,
        name
      ),
      module_topics:module_topics (
        topic_id,
        percentage,
        question_count
      )
    `)
    .order("order_index", { ascending: true });

  if (modulesError) {
    throw new Error("Failed to load test modules");
  }

  if (!modules || modules.length === 0) {
    throw new Error("No test modules available");
  }

  const currentModule = modules[currentModuleIndex];
  if (!currentModule) {
    throw new Error(`No module found at position ${currentModuleIndex + 1}`);
  }

  return currentModule;
}
