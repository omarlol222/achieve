import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SignUpForm } from "@/components/auth/SignUpForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-[120px] font-bold text-[#1B2E35] mb-6 leading-tight">
            Creative<br />Learning
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Your comprehensive platform for GAT preparation. Practice tests, real-time feedback, and personalized learning paths.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signin">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 bg-white rounded-lg shadow-sm border text-center">
            <h3 className="text-2xl font-semibold mb-4 text-[#1B2E35]">Practice Tests</h3>
            <p className="text-gray-600">
              Access a wide range of practice questions and full-length tests designed to simulate the actual GAT experience.
            </p>
          </div>
          <div className="p-8 bg-white rounded-lg shadow-sm border text-center">
            <h3 className="text-2xl font-semibold mb-4 text-[#1B2E35]">Real-time Feedback</h3>
            <p className="text-gray-600">
              Get instant feedback on your performance with detailed explanations and personalized recommendations.
            </p>
          </div>
          <div className="p-8 bg-white rounded-lg shadow-sm border text-center">
            <h3 className="text-2xl font-semibold mb-4 text-[#1B2E35]">Progress Tracking</h3>
            <p className="text-gray-600">
              Monitor your improvement with comprehensive analytics and detailed progress reports.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#1B2E35]">Ready to Start?</h2>
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;