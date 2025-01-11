import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import Shop from "@/pages/Shop";
import ProductDetails from "@/pages/ProductDetails";
import Index from "@/pages/Index";
import GAT from "@/pages/GAT";
import SignIn from "@/pages/SignIn";
import { ProtectedGatRoute } from "@/components/auth/ProtectedGatRoute";
import Practice from "@/pages/practice/Practice";
import PracticeSetup from "@/pages/practice/PracticeSetup";
import PracticeTest from "@/pages/practice/PracticeTest";
import Simulator from "@/pages/Simulator";
import SimulatorTest from "@/pages/simulator/SimulatorTest";
import SimulatorResults from "@/pages/simulator/SimulatorResults";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/signin" element={<SignIn />} />
            
            {/* GAT Routes */}
            <Route path="/gat" element={
              <ProtectedGatRoute>
                <GAT />
              </ProtectedGatRoute>
            } />
            
            {/* Practice Routes */}
            <Route path="/gat/practice" element={
              <ProtectedGatRoute>
                <Practice />
              </ProtectedGatRoute>
            } />
            <Route path="/gat/practice/setup" element={
              <ProtectedGatRoute>
                <PracticeSetup />
              </ProtectedGatRoute>
            } />
            <Route path="/gat/practice/test" element={
              <ProtectedGatRoute>
                <PracticeTest />
              </ProtectedGatRoute>
            } />
            
            {/* Simulator Routes */}
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
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;