import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle,
  CreditCard,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const navigate = useNavigate();

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

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/questions", icon: HelpCircle, label: "Questions" },
    { path: "/admin/tests", icon: ClipboardList, label: "Tests" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/payments", icon: CreditCard, label: "Payments" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-24 items-center">
          <Link to="/">
            <img
              src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png"
              alt="Achieve"
              className="h-24"
            />
          </Link>

          <div className="mx-auto text-2xl font-semibold">
            GAT
          </div>

          <nav className="flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;