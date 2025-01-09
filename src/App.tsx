import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Shop from "./pages/Shop";
import FAQ from "./pages/FAQ";
import SignIn from "./pages/SignIn";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Questions from "./pages/admin/Questions";
import Tests from "./pages/admin/Tests";
import Users from "./pages/admin/Users";
import Payments from "./pages/admin/Payments";
import GAT from "./pages/GAT";
import Practice from "./pages/practice/Practice";
import PracticeTest from "./pages/practice/PracticeTest";
import PracticeResults from "./pages/practice/PracticeResults";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      meta: {
        onError: (error: any) => {
          if (error?.message?.includes('refresh_token_not_found')) {
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
          <Route path="/gat" element={<GAT />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/test" element={<PracticeTest />} />
          <Route path="/practice/results" element={<PracticeResults />} />
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