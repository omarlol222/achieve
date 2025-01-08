import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold text-[#1B2E35]">
            Home
          </Link>
          <Link to="/about" className="text-[#1B2E35]">
            About
          </Link>
          <Link to="/shop" className="text-[#1B2E35]">
            Shop
          </Link>
          <Link to="/faq" className="text-[#1B2E35]">
            FAQ
          </Link>
          <Link to="/gat" className="text-[#1B2E35]">
            GAT
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <img
            src="/lovable-uploads/7ee2becb-9c22-4955-96fb-64c5201dbc54.png"
            alt="Achieve Logo"
            className="h-8"
          />
          <Link to="/signin">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}