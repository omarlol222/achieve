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

      const { data: userAccess } = await supabase
        .from("user_product_access")
        .select(`
          product:products(
            permissions:product_permissions(
              test_type:test_types(name)
            )
          )
        `)
        .eq("user_id", session.user.id)
        .gte("expires_at", new Date().toISOString())
        .limit(1);

      if (!userAccess || userAccess.length === 0 || !userAccess[0].product?.permissions?.some(p => p.test_type.name.toLowerCase().includes('gat'))) {
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