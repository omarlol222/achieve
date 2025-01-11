import { memo } from "react";
import { Card } from "@/components/ui/card";

type LearningCardProps = {
  title: string;
  icon: React.ElementType;
  onClick?: () => void;
};

export const LearningCard = memo(({ title, icon: Icon, onClick }: LearningCardProps) => (
  <Card 
    className="flex flex-col items-center justify-center p-8 bg-[#1B2B2B] text-white hover:bg-[#243636] transition-colors cursor-pointer"
    onClick={onClick}
  >
    <Icon className="w-8 h-8 mb-4" />
    <h3 className="text-xl font-semibold">{title}</h3>
  </Card>
));

LearningCard.displayName = "LearningCard";