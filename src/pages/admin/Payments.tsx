import { Card } from "@/components/ui/card";

const Payments = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      </div>

      <Card className="p-6">
        <div className="text-sm text-gray-600">No payments processed yet</div>
      </Card>
    </div>
  );
};

export default Payments;