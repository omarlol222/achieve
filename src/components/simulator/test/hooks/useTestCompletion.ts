import { useState } from "react";

export const useTestCompletion = () => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  return { currentModuleIndex, setCurrentModuleIndex };
};