import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "./button";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png" alt="Achieve" className="h-8" />
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-12 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/about" className="text-[#1B2E35] hover:text-gray-600 font-medium">ABOUT</Link>
            <Link to="/shop" className="text-[#1B2E35] hover:text-gray-600 font-medium">SHOP</Link>
            <Link to="/faq" className="text-[#1B2E35] hover:text-gray-600 font-medium">FAQ</Link>
          </div>

          {/* Sign In/Out Button */}
          <div className="hidden md:block">
            {!isAuthenticated ? (
              <Link 
                to="/signin" 
                className="border border-[#1B2E35] px-8 py-2 text-[#1B2E35] hover:bg-[#1B2E35] hover:text-white transition-colors"
              >
                SIGN IN
              </Link>
            ) : (
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                className="px-8 hover:bg-[#1B2E35] hover:text-white"
              >
                SIGN OUT
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/about" className="block text-[#1B2E35] hover:text-gray-600">ABOUT</Link>
            <Link to="/shop" className="block text-[#1B2E35] hover:text-gray-600">SHOP</Link>
            <Link to="/faq" className="block text-[#1B2E35] hover:text-gray-600">FAQ</Link>
            {!isAuthenticated ? (
              <Link 
                to="/signin" 
                className="block border border-[#1B2E35] px-6 py-2 text-center text-[#1B2E35] hover:bg-[#1B2E35] hover:text-white transition-colors"
              >
                SIGN IN
              </Link>
            ) : (
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                className="w-full hover:bg-[#1B2E35] hover:text-white"
              >
                SIGN OUT
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};