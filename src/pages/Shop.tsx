import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Shop = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Description */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-[#1B2E35]">Product Name</h1>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#1B2E35]">PRODUCT DESCRIPTION:</h2>
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis congue metus. 
                Nam imperdiet quis nunc et faucibus. Proin efficitur, ligula eu aliquam dictum, 
                nulla diam placerat augue, sed auctor arcu nisl in mauris. Cras ullamcorper hendrerit odio, 
                vitae vestibulum nisi placerat nec.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#1B2E35]">FEATURES:</h2>
              <ul className="space-y-3">
                {['Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum'].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-[#1B2E35]">✦</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Image and Price */}
          <div className="space-y-8">
            <Carousel className="w-full">
              <CarouselContent>
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video bg-[#1B2E35] rounded-lg"></div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>

            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-[#1B2E35] text-center">299 SAR</h2>
              <Button 
                className="w-full bg-[#1B2E35] hover:bg-[#2d3f48] text-white text-xl py-6"
              >
                BUY
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;