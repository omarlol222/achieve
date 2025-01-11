import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTestModules = (sessionId: string | undefined) => {
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ["test-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_modules")
        .select("*")
        .order("order_index");
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  return { modules, isLoadingModules };
};