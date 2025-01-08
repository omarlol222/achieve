import { Link } from "react-router-dom";
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

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => navigate("/about")}>
                About
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/shop")}>
                Shop
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/faq")}>
                FAQ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/gat")}>
                GAT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/" className="flex items-center">
            <img
              src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png"
              alt="Achieve"
              className="h-12" // Increased from h-8 to h-12
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {!session ? (
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          ) : (
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};