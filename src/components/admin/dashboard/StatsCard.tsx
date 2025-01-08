import { Card } from "@/components/ui/card";

type StatProps = {
  name: string;
  value: string;
  icon: any;
  change: string;
  changeType: "positive" | "negative" | "neutral";
};

export const StatsCard = ({ name, value, icon: Icon, change, changeType }: StatProps) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{name}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div
        className={`rounded-full p-3 ${
          changeType === "positive"
            ? "bg-green-100"
            : changeType === "negative"
            ? "bg-red-100"
            : "bg-gray-100"
        }`}
      >
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
    </div>
    <div className="mt-4">
      <span
        className={`text-sm ${
          changeType === "positive"
            ? "text-green-600"
            : changeType === "negative"
            ? "text-red-600"
            : "text-gray-600"
        }`}
      >
        {change} from last month
      </span>
    </div>
  </Card>
);