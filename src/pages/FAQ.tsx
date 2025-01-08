import { Navigation } from "@/components/ui/navigation";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-12 text-[#1B2E35] text-center">Frequently Asked Questions</h1>
          <div className="space-y-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border-b pb-8">
                <h3 className="text-xl font-semibold mb-4">Question {item}?</h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis congue metus.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;