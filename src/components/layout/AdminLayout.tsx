import { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle,
  CreditCard,
  Menu,
  ClipboardList
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/questions", icon: HelpCircle, label: "Questions" },
    { path: "/admin/tests", icon: ClipboardList, label: "Tests" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/payments", icon: CreditCard, label: "Payments" },
  ];

  const NavLink = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
          isActive
            ? "text-primary bg-primary/10 rounded-md"
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center gap-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="px-7">
                  <Link to="/" className="flex items-center mb-4">
                    <img
                      src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png"
                      alt="Achieve"
                      className="h-12"
                    />
                  </Link>
                  <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <NavLink key={item.path} item={item} />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/">
              <img
                src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png"
                alt="Achieve"
                className="h-12"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
            {menuItems.map((item) => (
              <NavLink key={item.path} item={item} />
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