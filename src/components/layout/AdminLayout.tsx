import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle,
  CreditCard,
  ClipboardList,
  Package
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/payments", icon: CreditCard, label: "Payments" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full border-b bg-white">
        <div className="container flex h-24 items-center">
          <Link to="/index" className="flex-shrink-0">
            <img
              src="/lovable-uploads/9b9962d6-d485-4e43-88c7-9325eb10bd74.png"
              alt="Achieve"
              className="h-12"
            />
          </Link>

          <nav className="ml-auto flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
                  "text-muted-foreground hover:text-primary hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;