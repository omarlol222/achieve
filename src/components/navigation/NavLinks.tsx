import { Link } from "react-router-dom";

export const NavLinks = () => (
  <div className="hidden md:flex items-center gap-12 text-lg font-medium">
    <Link to="/about" className="hover:text-primary">About</Link>
    <Link to="/shop" className="hover:text-primary">Shop</Link>
    <Link to="/faq" className="hover:text-primary">FAQ</Link>
  </div>
);