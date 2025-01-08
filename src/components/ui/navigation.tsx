import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png"
            alt="Achieve"
            className="h-8"
          />
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/about">
            <Button variant="ghost">About</Button>
          </Link>
          <Link to="/shop">
            <Button variant="ghost">Shop</Button>
          </Link>
          <Link to="/faq">
            <Button variant="ghost">FAQ</Button>
          </Link>
          <Link to="/gat">
            <Button variant="ghost">GAT</Button>
          </Link>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};