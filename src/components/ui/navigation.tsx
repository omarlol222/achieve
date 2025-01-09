import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGatRoute = location.pathname === '/gat';
  const isSimulatorRoute = location.pathname === '/simulator';
  const hideNavLinks = isGatRoute || isSimulatorRoute;

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: hasPurchased } = useQuery({
    queryKey: ["hasPurchased", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      const { data: purchases } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "completed")
        .limit(1);
      return purchases && purchases.length > 0;
    },
    enabled: !!session?.user?.id,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isAdmin = profile?.role === "admin";

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-24 flex items-center">
        <div className="flex-1">
          <Link to="/index" className="flex items-center">
            <img
              src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png"
              alt="Achieve"
              className="h-24"
            />
          </Link>
        </div>

        {session && hasPurchased && (
          <div className="flex-1 flex justify-center">
            <Link to="/gat" className="text-3xl font-bold hover:text-primary">
              GAT
            </Link>
          </div>
        )}

        <div className="flex-1 flex items-center justify-end gap-4">
          {!hideNavLinks && (
            <div className="hidden md:flex items-center gap-12 text-lg font-medium">
              <Link to="/about" className="hover:text-primary">About</Link>
              <Link to="/shop" className="hover:text-primary">Shop</Link>
              <Link to="/faq" className="hover:text-primary">FAQ</Link>
            </div>
          )}
          
          {isAdmin && (
            <Link to="/admin" className="hover:text-primary">
              Admin
            </Link>
          )}
          
          {!session ? (
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!hideNavLinks && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/about")}>
                      About
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/shop")}>
                      Shop
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/faq")}>
                      FAQ
                    </DropdownMenuItem>
                  </>
                )}
                {session && hasPurchased && (
                  <DropdownMenuItem onClick={() => navigate("/gat")}>
                    Dashboard
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};