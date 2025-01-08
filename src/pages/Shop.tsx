import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";

const Shop = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-12 text-[#1B2E35] text-center">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border rounded-lg p-6 space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg"></div>
              <h3 className="text-xl font-semibold">Product {item}</h3>
              <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <Button className="w-full">Add to Cart</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;