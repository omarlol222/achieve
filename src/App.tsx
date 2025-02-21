
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Index";
import Simulator from "@/pages/Simulator";
import SimulatorResults from "@/pages/simulator/SimulatorResults";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import GAT from "@/pages/GAT";
import English from "@/pages/gat/English";
import Math from "@/pages/gat/Math";
import EnglishPracticeSetup from "@/pages/gat/english/EnglishPracticeSetup";
import PracticeResults from "@/pages/gat/practice/PracticeResults";
import EnglishPractice from "@/pages/gat/english/EnglishPractice";
import MathPractice from "@/pages/gat/math/MathPractice";
import MathPracticeSetup from "@/pages/gat/math/MathPracticeSetup";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* GAT Routes */}
      <Route path="/gat">
        <Route index element={<GAT />} />
        <Route path="english" element={<English />} />
        <Route path="english/practice/:sessionId" element={<EnglishPractice />} />
        <Route path="english/practice/setup" element={<EnglishPracticeSetup />} />
        <Route path="math" element={<Math />} />
        <Route path="math/practice/:sessionId" element={<MathPractice />} />
        <Route path="math/practice/setup" element={<MathPracticeSetup />} />
        <Route path="practice/results/:sessionId" element={<PracticeResults />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="simulator/results/:sessionId" element={<SimulatorResults />} />
      </Route>
    </Routes>
  );
}

export default App;
