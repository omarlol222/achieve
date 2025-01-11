import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigation } from "@/hooks/useNavigation";

export const ProtectedGatRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasGatAccess } = useNavigation();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access GAT practice.",
          variant: "destructive",
        });
        navigate("/signin");
        return;
      }

      if (!hasGatAccess) {
        toast({
          title: "Access Required",
          description: "You don't have access to GAT practice. Please purchase access from the shop.",
          variant: "destructive",
        });
        navigate("/shop");
        return;
      }
    };

    checkAccess();
  }, [navigate, toast, hasGatAccess]);

  return <>{children}</>;
};