import { Link } from "react-router-dom";

const About = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h1 className="text-6xl font-bold mb-8">About<br />Achieve</h1>
            <p className="text-lg mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis congue metus. Nam imperdiet quis nunc et faucibus. Proin efficitur, ligula eu aliquam dictum, nulla diam placerat augue, sed auctor arcu nisl in mauris. Cras ullamcorper hendrerit odio, vitae vestibulum nisi placerat nec. Vivamus ut efficitur nisl.
            </p>
          </div>
          <div>
            <p className="text-lg mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis congue metus. Nam imperdiet quis nunc et faucibus. Proin efficitur, ligula eu aliquam dictum, nulla diam placerat augue, sed auctor arcu nisl in mauris.
            </p>
            <img 
              src="/lovable-uploads/1846549e-af07-434b-bee7-b5cb99f68fa9.png" 
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