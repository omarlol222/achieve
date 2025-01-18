import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedGatRoute } from "./components/auth/ProtectedGatRoute";

const GAT = lazy(() => import("./pages/GAT"));
const English = lazy(() => import("./pages/gat/English"));
const MathProgress = lazy(() => import("./pages/gat/Math"));
const Practice = lazy(() => import("./pages/practice/Practice"));
const PracticeTest = lazy(() => import("./pages/practice/PracticeTest"));
const Simulator = lazy(() => import("./pages/Simulator"));

function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default App;