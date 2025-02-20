import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import PasswordReset from "@/pages/PasswordReset";
import GAT from "@/pages/GAT";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminQuestions from "@/pages/admin/Questions";
import AdminTests from "@/pages/admin/Tests";
import AdminProducts from "@/pages/admin/Products";
import AdminUsers from "@/pages/admin/Users";
import AdminPayments from "@/pages/admin/Payments";
import AdminLayout from "@/components/layout/AdminLayout";
import { ProtectedGatRoute } from "@/components/auth/ProtectedGatRoute";
import Simulator from "@/pages/Simulator";
import SimulatorTest from "@/pages/simulator/SimulatorTest";
import SimulatorResults from "@/pages/simulator/SimulatorResults";
import AllTests from "@/pages/simulator/AllTests";
import Math from "@/pages/gat/Math";
import English from "@/pages/gat/English";
import MathPracticeSetup from "@/pages/gat/math/MathPracticeSetup";
import MathPractice from "@/pages/gat/math/MathPractice";
import EnglishPracticeSetup from "@/pages/gat/english/EnglishPracticeSetup";
import EnglishPractice from "@/pages/gat/english/EnglishPractice";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      
      <Route path="/gat" element={<ProtectedGatRoute />}>
        <Route index element={<GAT />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="simulator/test" element={<SimulatorTest />} />
        <Route path="simulator/results/:sessionId" element={<SimulatorResults />} />
        <Route path="simulator/all-tests" element={<AllTests />} />
        <Route path="math" element={<Math />} />
        <Route path="english" element={<English />} />
        <Route path="math/practice" element={<MathPracticeSetup />} />
        <Route path="math/practice/:sessionId" element={<MathPractice />} />
        <Route path="english/practice" element={<EnglishPracticeSetup />} />
        <Route path="english/practice/:sessionId" element={<EnglishPractice />} />
      </Route>

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="payments" element={<AdminPayments />} />
      </Route>

      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}
