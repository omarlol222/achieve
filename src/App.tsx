import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedGatRoute } from "@/components/auth/ProtectedGatRoute";

// Eagerly loaded components
import Landing from "./pages/Landing";
import AdminLayout from "./components/layout/AdminLayout";
import Index from "./pages/Index";

const About = lazy(() => import("./pages/About"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const FAQ = lazy(() => import("./pages/FAQ"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Questions = lazy(() => import("./pages/admin/Questions"));
const Tests = lazy(() => import("./pages/admin/Tests"));
const Products = lazy(() => import("./pages/admin/Products"));
const Users = lazy(() => import("./pages/admin/Users"));
const Payments = lazy(() => import("./pages/admin/Payments"));
const GAT = lazy(() => import("./pages/GAT"));
const Practice = lazy(() => import("./pages/practice/Practice"));
const PracticeTest = lazy(() => import("./pages/practice/PracticeTest"));
const Simulator = lazy(() => import("./pages/Simulator"));
const SimulatorTest = lazy(() => import("./pages/simulator/SimulatorTest"));
const SimulatorResults = lazy(() => import("./pages/simulator/SimulatorResults"));
const AllTests = lazy(() => import("./pages/simulator/AllTests"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetails />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/dashboard" element={
              <ProtectedGatRoute>
                <Dashboard />
              </ProtectedGatRoute>
            } />
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
            <Route path="/gat/leaderboard" element={
              <ProtectedGatRoute>
                <Leaderboard />
              </ProtectedGatRoute>
            } />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="questions" element={<Questions />} />
              <Route path="tests" element={<Tests />} />
              <Route path="products" element={<Products />} />
              <Route path="users" element={<Users />} />
              <Route path="payments" element={<Payments />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
