
import { create } from 'zustand'

type ModuleReview = {
  moduleId: string;
  isVisible: boolean;
}

interface SimulatorResultsState {
  selectedModuleId: string | null;
  moduleReviews: ModuleReview[];
  setSelectedModule: (moduleId: string | null) => void;
}

export const useSimulatorResultsStore = create<SimulatorResultsState>((set) => ({
  selectedModuleId: null,
  moduleReviews: [],
  setSelectedModule: (moduleId) => set({ selectedModuleId: moduleId }),
}))
