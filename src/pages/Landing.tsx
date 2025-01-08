import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <img src="/lovable-uploads/1846549e-af07-434b-bee7-b5cb99f68fa9.png" alt="Achieve" className="h-8" />
          </Link>
          <div className="flex items-center gap-8">
            <Link to="/about" className="hover:underline">ABOUT</Link>
            <Link to="/shop" className="hover:underline">SHOP</Link>
            <Link to="/faq" className="hover:underline">FAQ</Link>
            <Link to="/signin" className="border border-black px-6 py-2">SIGN IN</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-8xl font-bold mb-8">Creative<br />Learning</h1>
          <p className="text-xl mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis congue metus.
          </p>
          <Button className="bg-[#1B2E35] hover:bg-[#2C4752] text-lg px-8 py-6">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;