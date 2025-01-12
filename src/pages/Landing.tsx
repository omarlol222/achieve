import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-8xl font-bold mb-8 text-[#1B2E35]">GAT<br />Platform</h1>
          <p className="text-xl mb-8 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis congue metus.
          </p>
          <Button className="bg-[#13292a] hover:bg-[#285759] text-lg px-8 py-6">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
