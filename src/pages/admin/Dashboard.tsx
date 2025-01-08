import { Card } from "@/components/ui/card";
import { BarChart, Users, BookOpen, CreditCard } from "lucide-react";

const stats = [
  {
    name: "Total Users",
    value: "0",
    icon: Users,
    change: "+0%",
    changeType: "positive",
  },
  {
    name: "Active Questions",
    value: "0",
    icon: BookOpen,
    change: "+0%",
    changeType: "positive",
  },
  {
    name: "Total Revenue",
    value: "SAR 0",
    icon: CreditCard,
    change: "+0%",
    changeType: "positive",
  },
  {
    name: "Avg. Score",
    value: "0%",
    icon: BarChart,
    change: "0%",
    changeType: "neutral",
  },
];

const Dashboard = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                <span
                  className={`${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.change}
                </span>{" "}
                vs last month
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="mt-4 text-sm text-gray-600">No recent activity</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Overview
          </h2>
          <p className="mt-4 text-sm text-gray-600">No data available</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;