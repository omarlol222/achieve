import { Card } from "@/components/ui/card";

const Users = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <Card className="p-6">
        <div className="text-sm text-gray-600">No users registered yet</div>
      </Card>
    </div>
  );
};

export default Users;