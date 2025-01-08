import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is Achieve?",
      answer: "Achieve is an educational platform designed to help students excel in their academic journey through personalized learning experiences and comprehensive study materials."
    },
    {
      question: "How does the platform work?",
      answer: "Our platform provides interactive learning modules, practice questions, and personalized feedback to help students master various subjects at their own pace."
    },
    {
      question: "What subjects do you cover?",
      answer: "We cover a wide range of subjects including Mathematics, Sciences, Languages, and more. Each subject is broken down into topics with comprehensive study materials."
    },
    {
      question: "How much does it cost?",
      answer: "We offer various subscription plans to suit different needs. Visit our shop page to learn more about our pricing and available packages."
    },
    {
      question: "Can I try before subscribing?",
      answer: "Yes! We offer a free trial period where you can explore our platform and experience our learning materials firsthand."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <img src="/lovable-uploads/518f5302-9a07-4e4c-9c5e-b2c8e166a630.png" alt="Achieve" className="h-8" />
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
        <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQ;