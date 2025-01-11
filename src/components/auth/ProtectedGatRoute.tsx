import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ProtectedGatRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

      const { data: purchases } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "completed")
        .limit(1);

      if (!purchases || purchases.length === 0) {
        toast({
          title: "Purchase Required",
          description: "Please purchase access to use GAT practice.",
          variant: "destructive",
        });
        navigate("/shop");
      }
    };

    checkAccess();
  }, [navigate, toast]);

  return <>{children}</>;
};