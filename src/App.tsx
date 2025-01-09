import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Shop from "@/pages/Shop";
import FAQ from "@/pages/FAQ";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import GAT from "@/pages/GAT";
import Practice from "@/pages/Practice";
import Admin from "@/pages/admin/Admin";
import Dashboard from "@/pages/admin/Dashboard";
import Questions from "@/pages/admin/Questions";
import Users from "@/pages/admin/Users";
import Simulator from "@/pages/Simulator";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/gat" element={<GAT />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path="questions" element={<Questions />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;