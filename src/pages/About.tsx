import { Navigation } from "@/components/ui/navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#1B2E35]">About Us</h1>
          <div className="space-y-8">
            <p className="text-lg text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis congue metus. Nam imperdiet quis nunc et faucibus. Proin efficitur, ligula eu aliquam dictum, nulla diam placerat augue, sed auctor arcu nisl in mauris.
            </p>
            <img 
              src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png" 
              alt="Team" 
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;