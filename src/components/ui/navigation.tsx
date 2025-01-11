import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "../navigation/Logo";
import { NavLinks } from "../navigation/NavLinks";
import { UserMenu } from "../navigation/UserMenu";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGatRoute = location.pathname === '/gat';
  const isSimulatorRoute = location.pathname === '/simulator';
  const isSimulatorResults = location.pathname.includes('/gat/simulator/results/');
  const hideNavLinks = isGatRoute || isSimulatorRoute || isSimulatorResults;

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
        .maybeSingle();
      
      if (error) {
        console.error("Profile fetch error:", error);
        return null;
      }
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
          <Logo />
        </div>

        <div className="flex-1 flex justify-center">
          {!hideNavLinks && <NavLinks />}
        </div>

        <div className="flex-1 flex items-center justify-end gap-4">
          {isAdmin && !hideNavLinks && (
            <Link to="/admin">
              <Button variant="outline">Admin</Button>
            </Link>
          )}
          {session && hasPurchased && !hideNavLinks && (
            <Link to="/gat">
              <Button variant="outline">Dashboard</Button>
            </Link>
          )}
          
          {!session ? (
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <UserMenu 
              isAdmin={isAdmin}
              hasPurchased={hasPurchased || false}
              hideNavLinks={hideNavLinks}
              handleSignOut={handleSignOut}
            />
          )}
        </div>
      </div>
    </nav>
  );
};