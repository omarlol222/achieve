import { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <Link to="/index">
            <img
              src="/lovable-uploads/9b9962d6-d485-4e43-88c7-9325eb10bd74.png"
              alt="Achieve"
              className="h-8"
            />
          </Link>
        </div>
        <Separator />
        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md mb-1",
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                location.pathname === item.path && "bg-gray-50 text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;