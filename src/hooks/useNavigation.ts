import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };

    checkSession();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
    enabled: !!userId,
  });

  const { data: platformAccess } = useQuery({
    queryKey: ["platform-access", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .rpc('check_platform_access', {
          user_id_input: userId,
          platform: 'gat'
        });

      if (error) {
        toast({
          title: "Error checking platform access",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return data;
    },
    enabled: !!userId,
  });

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUserId(null);
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const hideNavLinks = location.pathname.includes("/simulator/results") || 
                      location.pathname.includes("/gat/simulator") || 
                      location.pathname.includes("/gat/practice") ||
                      location.pathname.startsWith("/gat");

  const isAdmin = profile?.role === "admin";
  const hasGatAccess = platformAccess === true;

  return {
    userId,
    isAdmin,
    hasGatAccess,
    hideNavLinks,
    handleSignOut,
  };
};