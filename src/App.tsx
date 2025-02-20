
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Index";
import Simulator from "@/pages/Simulator";
import SimulatorResults from "@/pages/simulator/SimulatorResults";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import GAT from "@/pages/GAT";
import English from "@/pages/gat/English";
import EnglishPracticeSetup from "@/pages/gat/english/EnglishPracticeSetup";
import PracticeResults from "@/pages/gat/practice/PracticeResults";
import EnglishPractice from "@/pages/gat/english/EnglishPractice";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/simulator/results" element={<SimulatorResults />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* GAT Routes */}
      <Route path="/gat">
        <Route index element={<GAT />} />
        <Route path="english" element={<English />} />
        <Route path="english/practice/:sessionId" element={<EnglishPractice />} />
        <Route path="english/practice/setup" element={<EnglishPracticeSetup />} />
        <Route path="practice/results/:sessionId" element={<PracticeResults />} />
      </Route>
    </Routes>
  );
}

export default App;
