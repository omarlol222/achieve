import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Shop = () => {
  const products = [
    {
      id: 1,
      name: "PRODUCT NAME",
      description: "PRODUCT DESCRIPTION",
      features: ["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"],
      price: "299 SAR"
    },
    {
      id: 2,
      name: "PRODUCT NAME",
      description: "PRODUCT DESCRIPTION",
      features: ["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"],
      price: "299 SAR"
    },
    {
      id: 3,
      name: "PRODUCT NAME",
      description: "PRODUCT DESCRIPTION",
      features: ["Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum", "Lorem Ipsum"],
      price: "299 SAR"
    }
  ];

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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-6xl font-bold text-center mb-16">Shop</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-primary">✦</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="text-3xl font-bold mb-4">{product.price}</p>
                <Button className="w-full bg-[#1B2E35] hover:bg-[#2C4752]">BUY</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;