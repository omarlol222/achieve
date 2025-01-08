import { Card } from "@/components/ui/card";

type LearningCardProps = {
  title: string;
  icon: React.ElementType;
};

export const LearningCard = ({ title, icon: Icon }: LearningCardProps) => (
  <Card className="flex flex-col items-center justify-center p-8 bg-[#1B2B2B] text-white hover:bg-[#243636] transition-colors cursor-pointer">
    <Icon className="w-8 h-8 mb-4" />
    <h3 className="text-xl font-semibold">{title}</h3>
  </Card>
);