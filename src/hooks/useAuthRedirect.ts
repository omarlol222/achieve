import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role === "admin") {
            navigate("/admin");
            return;
          } else {
            setError("Access denied. Admin privileges required.");
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        setError("An error occurred while checking your session.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role === "admin") {
            navigate("/admin");
            return;
          } else {
            setError("Access denied. Admin privileges required.");
          }
        }

        if (event === "SIGNED_OUT") {
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { error, isLoading };
};