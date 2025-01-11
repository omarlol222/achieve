import { memo } from "react";
import { LearningGrid } from "./learning/LearningGrid";

export const LearningSection = memo(() => (
  <section className="space-y-6">
    <h2 className="text-2xl font-bold text-[#1B2B2B]">Learning center</h2>
    <LearningGrid />
  </section>
));

LearningSection.displayName = "LearningSection";