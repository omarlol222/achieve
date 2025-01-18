import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedGatRoute } from "./components/auth/ProtectedGatRoute";

const GAT = lazy(() => import("./pages/GAT"));
const English = lazy(() => import("./pages/gat/English"));
const MathProgress = lazy(() => import("./pages/gat/Math"));
const Practice = lazy(() => import("./pages/practice/Practice"));
const PracticeTest = lazy(() => import("./pages/practice/PracticeTest"));
const Simulator = lazy(() => import("./pages/Simulator"));
const Index = lazy(() => import("./pages/Index"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));

// Admin pages
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminQuestions = lazy(() => import("./pages/admin/Questions"));
const AdminTests = lazy(() => import("./pages/admin/Tests"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminPayments = lazy(() => import("./pages/admin/Payments"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/index" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:id" element={<ProductDetails />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/gat" element={<GAT />} />
      <Route path="/gat/english" element={
        <ProtectedGatRoute>
          <English />
        </ProtectedGatRoute>
      } />
      <Route path="/gat/math" element={
        <ProtectedGatRoute>
          <MathProgress />
        </ProtectedGatRoute>
      } />
      <Route path="/gat/practice" element={<Practice />} />
      <Route path="/gat/practice-test" element={<PracticeTest />} />
      <Route path="/simulator" element={<Simulator />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<AdminPayments />} />
      </Route>
    </Routes>
  );
}

export default App;