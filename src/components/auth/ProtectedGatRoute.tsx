import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

export const ProtectedGatRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["user-purchases", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      
      const { data } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "completed")
        .limit(1);
      
      return data;
    },
    enabled: !!session?.user.id,
  });

  useEffect(() => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access GAT practice.",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (!isLoading && (!purchases || purchases.length === 0)) {
      toast({
        title: "Purchase Required",
        description: "Please purchase access to use GAT practice.",
        variant: "destructive",
      });
      navigate("/shop");
    }
  }, [session, purchases, isLoading, navigate, toast]);

  if (isLoading) {
    return null; // Or a loading spinner component
  }

  return <>{children}</>;
};