import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/ui/sidebar";

const AdminLayout = () => {
  const navigate = useNavigate();

  // Check if user is authenticated and has admin role
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        throw new Error("Not authenticated");
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        navigate("/");
        throw error;
      }
      
      if (!profile || profile.role !== "admin") {
        navigate("/");
        throw new Error("Not authorized");
      }

      return profile;
    },
  });

  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/");
    }
  }, [isLoading, profile, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;