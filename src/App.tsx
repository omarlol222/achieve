import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedGatRoute } from "@/components/auth/ProtectedGatRoute";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Shop from "./pages/Shop";
import FAQ from "./pages/FAQ";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Questions from "./pages/admin/Questions";
import Tests from "./pages/admin/Tests";
import Users from "./pages/admin/Users";
import Payments from "./pages/admin/Payments";
import GAT from "./pages/GAT";
import Practice from "./pages/practice/Practice";
import PracticeTest from "./pages/practice/PracticeTest";
import Simulator from "./pages/Simulator";
import SimulatorTest from "./pages/simulator/SimulatorTest";
import SimulatorResults from "./pages/simulator/SimulatorResults";
import AllTests from "./pages/simulator/AllTests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      meta: {
        onError: (error: any) => {
          if (error?.message?.includes('refresh_token_not_found') || 
              error?.message?.includes('Invalid Refresh Token')) {
            localStorage.removeItem('supabase.auth.token');
            window.location.href = '/signin';
          }
        },
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/index" replace />} />
          <Route path="/index" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/gat" element={
            <ProtectedGatRoute>
              <GAT />
            </ProtectedGatRoute>
          } />
          <Route path="/gat/practice" element={
            <ProtectedGatRoute>
              <Practice />
            </ProtectedGatRoute>
          } />
          <Route path="/gat/practice/test" element={
            <ProtectedGatRoute>
              <PracticeTest />
            </ProtectedGatRoute>
          } />
          <Route path="/gat/simulator" element={
            <ProtectedGatRoute>
              <Simulator />
            </ProtectedGatRoute>
          } />
          <Route path="/gat/simulator/test" element={
            <ProtectedGatRoute>
              <SimulatorTest />
            </ProtectedGatRoute>
          } />
          <Route path="/gat/simulator/results/:sessionId" element={
            <ProtectedGatRoute>
              <SimulatorResults />
            </ProtectedGatRoute>
          } />
          <Route path="/gat/simulator/all-tests" element={
            <ProtectedGatRoute>
              <AllTests />
            </ProtectedGatRoute>
          } />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="questions" element={<Questions />} />
            <Route path="tests" element={<Tests />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;